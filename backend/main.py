from __future__ import annotations

import logging
import time
import traceback
import uuid
from datetime import datetime
from typing import Any, AsyncIterator, Iterator

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, StreamingResponse

from backend.rag_chain import get_answer, stream_answer
from backend.vector_store import AppSettings, verify_vector_store_connection
from backend.documents import router as documents_router
from backend.chat_logs import router as chat_logs_router, chat_logs, ChatLogEntry, MAX_LOGS
from backend.settings import router as settings_router

logger = logging.getLogger(__name__)

app = FastAPI(title="RAG Chatbot", version="1.0.0")

settings = AppSettings()


@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next: Any) -> JSONResponse | StreamingResponse:
    """
    Add an `X-Request-ID` header to every response so clients can trace requests.
    """
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return structured validation errors."""
    request_id = getattr(request.state, "request_id", None)
    payload = {
        "error": "validation_error",
        "request_id": request_id,
        "message": "Request validation failed.",
        "details": exc.errors(),
    }
    return JSONResponse(status_code=422, content=payload)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Return structured HTTP errors."""
    request_id = getattr(request.state, "request_id", None)
    payload = {
        "error": "http_error",
        "request_id": request_id,
        "message": exc.detail if isinstance(exc.detail, str) else "HTTP error",
        "status_code": exc.status_code,
    }
    return JSONResponse(status_code=exc.status_code, content=payload)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Return structured JSON error for unexpected failures."""
    request_id = getattr(request.state, "request_id", None)
    logger.error("Unhandled error. request_id=%s", request_id, exc_info=exc)
    payload = {
        "error": "internal_error",
        "request_id": request_id,
        "message": "An internal error occurred.",
        "details": {"trace": traceback.format_exception_only(type(exc), exc)[-1].strip()},
    }
    return JSONResponse(status_code=500, content=payload)


@app.on_event("startup")
async def on_startup() -> None:
    """Verify vector DB connectivity before serving requests."""
    try:
        await verify_vector_store_connection()
    except Exception as exc:
        logger.exception("Vector store verification failed during startup: %s", exc)
        raise
    
# Register document management router
app.include_router(documents_router, prefix="")
app.include_router(chat_logs_router, prefix="")
app.include_router(settings_router, prefix="")

# NOTE: We define Pydantic models inline to keep the module self-contained.
# The required names must match the user spec.
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Chat request payload."""

    query: str = Field(min_length=1, max_length=500)


class ChatResponse(BaseModel):
    """Chat response payload."""

    answer: str
    sources: list[str]
    latency_ms: float


@app.get("/")
async def root() -> RedirectResponse:
    """Redirect to API docs."""
    return RedirectResponse(url="/docs")


@app.get("/health", summary="Health check")
async def health() -> dict[str, str]:
    """Basic health endpoint for orchestration systems."""
    return {"status": "ok", "version": "1.0.0"}


@app.post("/chat", response_model=ChatResponse, summary="Generate answer")
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    """Generate an answer based on retrieved internal documents."""
    start = time.perf_counter()
    try:
        result = get_answer(payload.query)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConnectionError as exc:
        raise HTTPException(status_code=502, detail="Upstream dependency unavailable.") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to generate answer.") from exc
    latency_ms = (time.perf_counter() - start) * 1000.0
    answer = str(result.get("answer", ""))
    sources = list(result.get("sources", []))

    # Log the interaction
    try:
        user_id = request.headers.get("X-User-Id", "anonymous")
        entry = ChatLogEntry(
            id=str(uuid.uuid4()),
            user_id=user_id,
            query=payload.query,
            answer=answer,
            sources=sources,
            response_time_ms=latency_ms,
            timestamp=datetime.utcnow(),
            has_answer="I don't have enough information" not in answer.lower(),
        )
        chat_logs.append(entry)
        if len(chat_logs) > MAX_LOGS:
            chat_logs.pop(0)
    except Exception as log_exc:
        logger.warning("Failed to log chat entry: %s", log_exc)

    return ChatResponse(answer=answer, sources=sources, latency_ms=latency_ms)


async def sse_event_generator(
    query: str,
    user_id: str = "anonymous",
    start_time: float = 0.0,
) -> AsyncIterator[bytes]:
    """
    Stream answer tokens as SSE messages.

    Collects tokens to build the full answer for logging.
    The rag layer yields token strings and may also yield a special event:
    `data: [SOURCES]:<json>`.

    IMPORTANT: logging happens BEFORE yielding [DONE].  A yield inside a
    finally block is unsafe — when the client disconnects Python throws
    GeneratorExit into the generator and any yield in finally raises
    RuntimeError, so the code after that yield (logging) would never run.
    """
    import json as _json
    tokens: list[str] = []
    sources: list[str] = []

    try:
        iterator: Iterator[str] = stream_answer(query)
        for token in iterator:
            if token.startswith("[SOURCES]:"):
                try:
                    sources = _json.loads(token[len("[SOURCES]:"):])
                except Exception:
                    sources = []
            else:
                tokens.append(token)
            # Each yielded item is formatted as its own SSE message line.
            yield f"data: {token}\n\n".encode("utf-8")
    except HTTPException:
        # Let FastAPI handle HTTPExceptions (they can happen only before streaming starts).
        raise
    except Exception:
        logger.exception("Streaming failed.")
        # Ensure the frontend can finish the stream gracefully.
        yield "data: An error occurred while generating the answer.\n\n".encode("utf-8")

    # Log BEFORE yielding [DONE] so the log write is guaranteed to execute
    # even if the client closes the connection immediately after [DONE].
    try:
        latency_ms = (time.perf_counter() - start_time) * 1000.0
        full_answer = "".join(tokens)
        entry = ChatLogEntry(
            id=str(uuid.uuid4()),
            user_id=user_id,
            query=query,
            answer=full_answer,
            sources=sources,
            response_time_ms=latency_ms,
            timestamp=datetime.utcnow(),
            has_answer="i don't have enough information" not in full_answer.lower(),
        )
        chat_logs.append(entry)
        if len(chat_logs) > MAX_LOGS:
            chat_logs.pop(0)
        logger.info("Chat logged: user=%s query_len=%d", user_id, len(query))
    except Exception as log_exc:
        logger.warning("Failed to log streamed chat entry: %s", log_exc)

    yield "data: [DONE]\n\n".encode("utf-8")


@app.post("/chat/stream", summary="Stream answer via SSE")
async def chat_stream(payload: ChatRequest, request: Request) -> StreamingResponse:
    """Stream answer tokens using SSE format: `data: <token>\\n\\n`."""
    user_id = request.headers.get("X-User-Id", "anonymous")
    start = time.perf_counter()
    return StreamingResponse(
        sse_event_generator(payload.query, user_id=user_id, start_time=start),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/admin/chat-logs/debug", summary="Debug: raw log count + last entry")
async def debug_chat_logs() -> dict:
    """Temporary debug endpoint — shows raw log count and the most recent entry."""
    return {
        "count": len(chat_logs),
        "last": chat_logs[-1].model_dump(mode="json") if chat_logs else None,
    }


__all__ = ["app", "ChatRequest", "ChatResponse"]

