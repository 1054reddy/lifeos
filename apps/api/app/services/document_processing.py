from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Document
from app.services.document_extraction import extract_pdf_text
from app.services.document_storage import STORAGE_ROOT


def process_document(
    document: Document,
    db: Session,
) -> str:
    """
    Process a stored document.

    Lifecycle:
        uploaded -> processing -> ready

    If processing fails:
        processing -> failed
    """
    document.status = "processing"
    db.commit()
    db.refresh(document)

    try:
        file_path = STORAGE_ROOT / document.storage_path

        if not file_path.is_file():
            raise FileNotFoundError(
                f"Document file not found: {file_path}"
            )

        extracted_text = extract_pdf_text(file_path)

        document.status = "ready"
        db.commit()
        db.refresh(document)

        return extracted_text

    except Exception:
        document.status = "failed"
        db.commit()
        db.refresh(document)

        raise


def process_document_in_background(
    document_id: UUID,
) -> None:
    """
    Process a document in a background task.

    A fresh database session is created because the
    original request session must not be reused.
    """
    db = SessionLocal()

    try:
        document = db.scalar(
            select(Document).where(
                Document.id == document_id,
            )
        )

        if document is None:
            return

        if document.status != "uploaded":
            return

        process_document(
            document,
            db,
        )

    finally:
        db.close()