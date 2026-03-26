from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from backend.documents import verify_admin_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["chat-logs"])

# --- Models ---

class ChatLogEntry(BaseModel):
    """A single recorded chat interaction."""
    id: str
    user_id: str
    query: str
    answer: str
    sources: list[str]
    response_time_ms: float
    timestamp: datetime
    has_answer: bool

class ChatLogStats(BaseModel):
    """Aggregate statistics over all chat logs."""
    total_queries: int
    answered_count: int
    unanswered_count: int
    avg_response_ms: float
    unique_users: int
    queries_today: int

# --- In-memory store ---

chat_logs: list[ChatLogEntry] = []
MAX_LOGS = 500

# --- Endpoints ---

@router.get("/chat-logs", dependencies=[Depends(verify_admin_key)])
def get_chat_logs(
    limit: int = 50,
    offset: int = 0,
    user_id: Optional[str] = None,
    search: Optional[str] = None,
    has_answer: Optional[bool] = None,
) -> dict:
    """Return paginated chat logs with optional filtering."""
    results = list(chat_logs)

    if user_id:
        results = [e for e in results if e.user_id == user_id]
    if search:
        lower = search.lower()
        results = [e for e in results if lower in e.query.lower()]
    if has_answer is not None:
        results = [e for e in results if e.has_answer == has_answer]

    # Newest first
    results.sort(key=lambda e: e.timestamp, reverse=True)
    total = len(results)
    page = results[offset : offset + limit]
    return {"logs": [e.model_dump(mode="json") for e in page], "total": total}


@router.get("/chat-logs/stats", dependencies=[Depends(verify_admin_key)])
def get_chat_log_stats() -> ChatLogStats:
    """Return aggregate stats for the chat logs dashboard."""
    if not chat_logs:
        return ChatLogStats(
            total_queries=0,
            answered_count=0,
            unanswered_count=0,
            avg_response_ms=0.0,
            unique_users=0,
            queries_today=0,
        )

    answered = [e for e in chat_logs if e.has_answer]
    today = datetime.utcnow().date()
    queries_today = sum(1 for e in chat_logs if e.timestamp.date() == today)
    avg_ms = sum(e.response_time_ms for e in chat_logs) / len(chat_logs)

    return ChatLogStats(
        total_queries=len(chat_logs),
        answered_count=len(answered),
        unanswered_count=len(chat_logs) - len(answered),
        avg_response_ms=round(avg_ms, 1),
        unique_users=len({e.user_id for e in chat_logs}),
        queries_today=queries_today,
    )


class UserStats(BaseModel):
    """Aggregate user activity stats derived from chat logs."""
    total_queries: int
    unique_users: int
    avg_queries_per_user: float


@router.get("/users/stats", dependencies=[Depends(verify_admin_key)])
def get_user_stats() -> UserStats:
    """Return user activity stats computed from the chat log in-memory store."""
    if not chat_logs:
        return UserStats(total_queries=0, unique_users=0, avg_queries_per_user=0.0)

    total = len(chat_logs)
    unique = len({e.user_id for e in chat_logs})
    avg = round(total / unique, 1) if unique else 0.0
    return UserStats(total_queries=total, unique_users=unique, avg_queries_per_user=avg)
