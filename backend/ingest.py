from __future__ import annotations

import argparse
import logging
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.vector_store import get_vector_store

logger = logging.getLogger(__name__)


SUPPORTED_PDF_EXTENSIONS = {".pdf"}
SUPPORTED_TXT_EXTENSIONS = {".txt"}


def _iter_supported_files(data_dir: Path) -> Iterable[Path]:
    """Yield supported document files found under the data directory."""
    for path in sorted(data_dir.rglob("*")):
        if not path.is_file():
            continue
        suffix = path.suffix.lower()
        if suffix in SUPPORTED_PDF_EXTENSIONS or suffix in SUPPORTED_TXT_EXTENSIONS:
            yield path
        else:
            # Skip other formats while warning the operator.
            logger.warning("Skipping unsupported file format: %s", path)


def _load_pdf(file_path: Path) -> list[Document]:
    """Load a PDF and return LangChain `Document` objects (page-level)."""
    try:
        reader = PdfReader(str(file_path))
    except FileNotFoundError:
        raise
    except Exception as exc:
        raise ValueError(f"Failed to read PDF: {file_path.name}") from exc

    docs: list[Document] = []
    for page_index, page in enumerate(reader.pages):
        try:
            text = page.extract_text() or ""
        except Exception as exc:
            logger.warning("PDF page extraction failed (%s page=%d): %s", file_path.name, page_index, exc)
            text = ""

        content = text.strip()
        if not content:
            continue

        docs.append(
            Document(
                page_content=content,
                metadata={"source": file_path.name, "page": page_index + 1},
            )
        )
    return docs


def _load_txt(file_path: Path) -> list[Document]:
    """Load a TXT file and return a single LangChain `Document`."""
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore").strip()
    except FileNotFoundError:
        raise
    except Exception as exc:
        raise ValueError(f"Failed to read TXT: {file_path.name}") from exc

    if not content:
        return []

    return [Document(page_content=content, metadata={"source": file_path.name})]


def _load_documents(data_dir: Path) -> list[Document]:
    """
    Load all supported documents under `data_dir` into raw `Document` objects.
    """
    raw_docs: list[Document] = []
    for file_path in _iter_supported_files(data_dir):
        suffix = file_path.suffix.lower()
        if suffix in SUPPORTED_PDF_EXTENSIONS:
            raw_docs.extend(_load_pdf(file_path))
            continue
        if suffix in SUPPORTED_TXT_EXTENSIONS:
            raw_docs.extend(_load_txt(file_path))
            continue

        # Defensive: this should be impossible due to `_iter_supported_files`.
        raise ValueError(f"Unsupported file format encountered: {file_path}")

    return raw_docs


def _split_documents(docs: list[Document]) -> list[Document]:
    """Split raw documents into chunks suitable for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    return splitter.split_documents(docs)


def ingest(data_dir: str) -> None:
    """
    Ingest documents from disk into the configured vector store.

    Args:
        data_dir: Directory containing source documents (PDF/TXT).
    """
    data_path = Path(data_dir).resolve()
    if not data_path.exists():
        raise FileNotFoundError(f"Data directory not found: {data_path}")

    # Find supported files first (for logging clarity).
    supported_files = list(_iter_supported_files(data_path))
    logger.info("Files found: %d (supported).", len(supported_files))

    # Reload docs based on the same supported file set.
    # (We avoid re-walking with different rules to keep logs consistent.)
    raw_docs: list[Document] = []
    for file_path in supported_files:
        suffix = file_path.suffix.lower()
        if suffix in SUPPORTED_PDF_EXTENSIONS:
            raw_docs.extend(_load_pdf(file_path))
        elif suffix in SUPPORTED_TXT_EXTENSIONS:
            raw_docs.extend(_load_txt(file_path))
        else:
            raise ValueError(f"Unsupported file format encountered: {file_path}")

    if not raw_docs:
        logger.warning("No readable content found in supported documents.")
        return

    # Chunk and embed.
    chunks = _split_documents(raw_docs)
    logger.info("Chunks created: %d", len(chunks))

    # Upsert into vector store.
    try:
        adapter = get_vector_store()
        adapter.add_documents(chunks)
        logger.info("Upsert complete.")
    except ConnectionError as exc:
        logger.exception("Vector store connection failed.")
        raise exc
    except ValueError as exc:
        logger.exception("Ingestion failed due to invalid input.")
        raise exc


def _parse_args() -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(description="Ingest documents into the RAG vector store.")
    parser.add_argument("--data-dir", default="./data", help="Directory containing source documents (PDF/TXT).")
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    try:
        ingest(args.data_dir)
    except FileNotFoundError:
        logger.exception("Data ingestion failed: data directory not found.")
        raise
    except ConnectionError:
        logger.exception("Data ingestion failed: could not connect to the vector DB.")
        raise
    except ValueError:
        logger.exception("Data ingestion failed: unsupported or invalid document format.")
        raise

