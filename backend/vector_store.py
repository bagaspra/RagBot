from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Optional

from langchain_core.documents import Document

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class AppSettings(BaseSettings):
    """
    Centralized backend configuration driven by environment variables.
    Reads from .env file first, then OS environment variables.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # LLM Configuration
    LLM_PROVIDER: str = "groq"  # groq | deepseek
    GROQ_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = ""

    # Vector Database
    VECTOR_DB: str = "qdrant"  # qdrant | pinecone
    # Default to localhost for local development.
    # In docker-compose, this is overridden via env_file (.env).
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION_NAME: str = "rag_docs"

    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "rag-index"
    PINECONE_ENVIRONMENT: str = "us-east-1"

    # Backend Settings
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    LOG_LEVEL: str = "INFO"
    APP_VERSION: str = "1.0.0"
    ADMIN_API_KEY: str = "default_secret_key"


class VectorStoreAdapter(ABC):
    """
    Abstract adapter for vector databases used by the RAG pipeline.
    """

    @abstractmethod
    def add_documents(self, docs: list[Document]) -> None:
        """Upsert embedded documents into the backing vector store."""

    @abstractmethod
    def as_retriever(self, k: int):
        """Return a LangChain BaseRetriever configured to return k results."""


def _get_huggingface_embeddings():
    """
    Build embeddings used for ingestion and retrieval.

    Uses:
      - model: all-MiniLM-L6-v2
      - device: cpu
      - normalize_embeddings: True
    """
    from langchain_huggingface import HuggingFaceEmbeddings

    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def _normalized_vector_db_name(value: str) -> str:
    """Normalize the VECTOR_DB env var for comparisons."""
    return value.strip().lower()


class QdrantAdapter(VectorStoreAdapter):
    """
    Qdrant-backed vector store adapter.
    """

    def __init__(self, settings: AppSettings):
        # Qdrant clients and vector store adapters are optional at runtime
        # depending on VECTOR_DB choice.
        from qdrant_client import QdrantClient
        from langchain_qdrant import QdrantVectorStore

        self._settings = settings
        self._client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
            prefer_grpc=False,
        )

        self._embeddings = _get_huggingface_embeddings()
        self._ensure_collection_exists(settings.QDRANT_COLLECTION_NAME)

        # Avoid extra validation round-trips; we already ensure the collection exists.
        self._vector_store = QdrantVectorStore(
            client=self._client,
            collection_name=settings.QDRANT_COLLECTION_NAME,
            embedding=self._embeddings,
            validate_collection_config=False,
        )

    def _ensure_collection_exists(self, collection_name: str) -> None:
        """
        Ensure Qdrant collection exists (create if missing).

        `QdrantVectorStore` validates collection configuration on init, and will
        raise if the collection doesn't exist. Since ingestion might run
        separately, we create the collection here to keep the backend usable.
        """
        from qdrant_client import models

        try:
            self._client.get_collection(collection_name=collection_name)
            return
        except Exception:
            # If it exists, get_collection will succeed; otherwise we create it.
            pass

        try:
            # all-MiniLM-L6-v2 embedding size is constant (typically 384), but we
            # compute it from the embedding object to stay correct.
            probe = self._embeddings.embed_query("dimension probe")
            vector_size = len(probe)

            self._client.recreate_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
            )
            logger.info("Created missing Qdrant collection: %s", collection_name)
        except Exception as exc:
            logger.exception("Failed to create Qdrant collection: %s", collection_name)
            raise exc

    def add_documents(self, docs: list[Document]) -> None:
        """Add documents to Qdrant (creating the collection if needed)."""
        try:
            logger.info("Upserting %d chunks into Qdrant.", len(docs))
            self._vector_store.add_documents(docs)
        except Exception as exc:
            logger.exception("Failed to upsert documents into Qdrant.")
            raise exc

    def as_retriever(self, k: int):
        """Create a Qdrant retriever for the given k."""
        return self._vector_store.as_retriever(search_kwargs={"k": k})

    def verify_connection(self) -> None:
        """
        Verify Qdrant is reachable.

        This does not require that the target collection already exists.
        """
        try:
            _ = self._client.get_collections()
        except Exception as exc:
            logger.exception("Qdrant connectivity verification failed.")
            raise ConnectionError("Unable to connect to Qdrant.") from exc


class PineconeAdapter(VectorStoreAdapter):
    """
    Pinecone-backed vector store adapter.
    """

    def __init__(self, settings: AppSettings):
        from langchain_pinecone import PineconeVectorStore
        from pinecone import Pinecone

        self._settings = settings
        self._pinecone = Pinecone(api_key=settings.PINECONE_API_KEY)

        self._embeddings = _get_huggingface_embeddings()
        self._vector_store = PineconeVectorStore(
            index_name=settings.PINECONE_INDEX_NAME,
            embedding=self._embeddings,
        )

    def add_documents(self, docs: list[Document]) -> None:
        """Upsert documents into Pinecone."""
        try:
            logger.info("Upserting %d chunks into Pinecone.", len(docs))
            self._vector_store.add_documents(docs)
        except Exception as exc:
            logger.exception("Failed to upsert documents into Pinecone.")
            raise exc

    def as_retriever(self, k: int):
        """Create a Pinecone retriever for the given k."""
        return self._vector_store.as_retriever(search_kwargs={"k": k})

    def verify_connection(self) -> None:
        """Verify Pinecone API access and index existence."""
        try:
            _ = self._pinecone.list_indexes()
        except Exception as exc:
            logger.exception("Pinecone connectivity verification failed.")
            raise ConnectionError("Unable to connect to Pinecone.") from exc


def get_vector_store() -> VectorStoreAdapter:
    """
    Factory returning the configured vector store adapter.
    """
    settings = AppSettings()
    vector_db = _normalized_vector_db_name(settings.VECTOR_DB)

    if vector_db == "qdrant":
        return QdrantAdapter(settings)

    if vector_db == "pinecone":
        return PineconeAdapter(settings)

    raise ValueError(f"Unsupported VECTOR_DB: {settings.VECTOR_DB}")


async def verify_vector_store_connection() -> None:
    """
    Verify the configured vector store connection.

    Called at backend startup.
    """
    settings = AppSettings()
    vector_db = _normalized_vector_db_name(settings.VECTOR_DB)

    if vector_db == "qdrant":
        try:
            from qdrant_client import QdrantClient

            client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT, prefer_grpc=False)
            _ = client.get_collections()
            return
        except Exception as exc:
            logger.exception("Qdrant connectivity verification failed.")
            raise ConnectionError("Unable to connect to Qdrant.") from exc

    if vector_db == "pinecone":
        try:
            from pinecone import Pinecone

            pinecone = Pinecone(api_key=settings.PINECONE_API_KEY)
            _ = pinecone.list_indexes()
            return
        except Exception as exc:
            logger.exception("Pinecone connectivity verification failed.")
            raise ConnectionError("Unable to connect to Pinecone.") from exc

    raise ValueError(f"Unsupported VECTOR_DB: {settings.VECTOR_DB}")


__all__ = [
    "AppSettings",
    "VectorStoreAdapter",
    "QdrantAdapter",
    "PineconeAdapter",
    "get_vector_store",
    "verify_vector_store_connection",
]

