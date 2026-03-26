from __future__ import annotations

import json
import logging
import os
from typing import Any, Iterator, Sequence

from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_core.output_parsers import StrOutputParser

from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq  # type: ignore[import-not-found]

from backend.vector_store import get_vector_store, AppSettings

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """\
You are a helpful assistant for internal company documents.
Use the context provided below to inform your answers when relevant.
If the context does not provide sufficient information to answer the question,
you may draw from your general knowledge to provide a helpful response.
Clearly indicate when your answer is based on general knowledge rather than the provided documents.

Context:
{context}
"""


def _llm_factory(provider: str) -> Any:
    """
    Create the configured chat model.

    LLM_PROVIDER env var decides which provider to use.
    """
    settings = AppSettings()
    provider_normalized = provider.strip().lower()
    if provider_normalized == "groq":
        # Groq-backed LLM.
        # Note: `llama3-8b-8192` was decommissioned on Groq; recommended replacement:
        # `llama-3.1-8b-instant`.
        model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant").strip() or "llama-3.1-8b-instant"
        api_key = settings.GROQ_API_KEY
        if not api_key:
            raise ValueError("GROQ_API_KEY must be set when LLM_PROVIDER=groq.")
        return ChatGroq(model=model, temperature=0.2, api_key=api_key)

    if provider_normalized == "deepseek":
        # DeepSeek via OpenAI-compatible API.
        deepseek_base_url = os.getenv("DEEPSEEK_BASE_URL", "").strip()
        api_key = settings.DEEPSEEK_API_KEY or os.getenv("DEEPSEEK_API_KEY", "").strip()
        if not deepseek_base_url:
            raise ValueError("DEEPSEEK_BASE_URL must be set when LLM_PROVIDER=deepseek.")
        if not api_key:
            raise ValueError("DEEPSEEK_API_KEY must be set when LLM_PROVIDER=deepseek.")
        # Per your spec, we set base_url; `model` falls back to DeepSeek chat default.
        return ChatOpenAI(base_url=deepseek_base_url, api_key=api_key, model=os.getenv("DEEPSEEK_MODEL", "deepseek-chat"), temperature=0.2)

    raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")


def _format_context(docs: Sequence[Document]) -> str:
    """
    Format retrieved documents into a single context block.
    """
    # Keep formatting deterministic to make streaming and debugging easier.
    blocks: list[str] = []
    for doc in docs:
        source = str(doc.metadata.get("source", "unknown_document"))
        content = (doc.page_content or "").strip()
        if not content:
            continue
        blocks.append(f"[Source: {source}]\n{content}")
    return "\n\n".join(blocks)


def _extract_sources(docs: Sequence[Document]) -> list[str]:
    """
    Extract unique source filenames from retrieved documents.
    """
    sources: list[str] = []
    seen: set[str] = set()
    for doc in docs:
        source = str(doc.metadata.get("source", "unknown_document"))
        if source in seen:
            continue
        seen.add(source)
        sources.append(source)
    return sources


def _build_prompt() -> ChatPromptTemplate:
    """
    Build the strict prompt template used for every answer.
    """
    # The system prompt includes `context`, while the human message uses the `question`.
    return ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("human", "{question}"),
        ]
    )


def get_answer(query: str) -> dict[str, Any]:
    """
    Retrieve documents, generate a grounded answer, and return sources.

    Returns:
        {"answer": str, "sources": list[str]}
    """
    if not query.strip():
        raise ValueError("Query must not be empty.")

    provider = os.getenv("LLM_PROVIDER", "groq")
    llm = _llm_factory(provider)
    retriever = get_vector_store().as_retriever(k=3)

    # Retrieve context first (non-streaming).
    # LangChain retrievers are Runnable-like; `invoke` is the stable API.
    docs = retriever.invoke(query)
    context = _format_context(docs)
    sources = _extract_sources(docs)

    # Build and run the chain: prompt -> LLM -> parser.
    prompt = _build_prompt()
    chain = prompt | llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": query})
    return {"answer": str(answer), "sources": sources}


def stream_answer(query: str) -> Iterator[str]:
    """
    Stream answer tokens for SSE.

    Yields:
        - "..." token fragments (plain text)
        - finally: "[SOURCES]:<json array of source filenames>"
    """
    if not query.strip():
        raise ValueError("Query must not be empty.")

    provider = os.getenv("LLM_PROVIDER", "groq")
    llm = _llm_factory(provider)
    retriever = get_vector_store().as_retriever(k=3)

    # Retrieve context up-front so the strict system prompt is consistent.
    # LangChain retrievers are Runnable-like; `invoke` is the stable API.
    docs = retriever.invoke(query)
    context = _format_context(docs)
    sources = _extract_sources(docs)

    prompt = _build_prompt()
    messages = prompt.format_messages(context=context, question=query)

    # Stream content chunks. LangChain returns message chunks; content can be None.
    try:
        for chunk in llm.stream(messages):
            token = getattr(chunk, "content", None)
            if token:
                yield str(token)
    except Exception as exc:
        logger.exception("stream_answer failed: %s", exc)
        raise

    # Emit sources as a dedicated SSE-compatible event payload.
    yield f"[SOURCES]:{json.dumps(sources)}"


__all__ = ["get_answer", "stream_answer"]

