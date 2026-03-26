from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from backend.documents import verify_admin_key, get_vector_store, settings as doc_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["settings"])


class RagSettings(BaseModel):
    """Configurable RAG pipeline parameters (in-memory, reset on restart)."""
    top_k: int = Field(default=3, ge=1, le=10)
    score_threshold: float = Field(default=0.70, ge=0.0, le=1.0)
    strict_mode: bool = True
    show_sources: bool = True
    max_query_length: int = Field(default=500, ge=1, le=2000)


# Shared in-memory settings instance
rag_settings = RagSettings()


@router.get("/settings/rag", dependencies=[Depends(verify_admin_key)])
def get_rag_settings() -> RagSettings:
    """Return current RAG configuration settings."""
    return rag_settings


@router.post("/settings/rag", dependencies=[Depends(verify_admin_key)])
def update_rag_settings(body: RagSettings) -> RagSettings:
    """Update RAG configuration settings in memory."""
    global rag_settings
    rag_settings = body
    logger.info("RAG settings updated: %s", rag_settings.model_dump())
    return rag_settings


@router.post("/settings/clear-vectors", dependencies=[Depends(verify_admin_key)])
def clear_vectors() -> dict:
    """Delete all vectors from Qdrant collection and recreate it."""
    try:
        from qdrant_client import models as qmodels
        adapter = get_vector_store()
        client = adapter._client
        collection = doc_settings.QDRANT_COLLECTION_NAME

        # Count existing points before clearing
        info = client.get_collection(collection)
        chunks_deleted: int = info.points_count or 0

        # Delete and recreate collection
        client.delete_collection(collection)
        client.create_collection(
            collection_name=collection,
            vectors_config=qmodels.VectorParams(
                size=1536,
                distance=qmodels.Distance.COSINE,
            ),
        )
        logger.info("Cleared Qdrant collection '%s': %d chunks removed.", collection, chunks_deleted)
        return {"cleared": True, "chunks_deleted": chunks_deleted}
    except Exception as exc:
        logger.exception("Failed to clear Qdrant vectors: %s", exc)
        return {"cleared": False, "error": str(exc)}
