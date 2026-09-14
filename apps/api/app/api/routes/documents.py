from pathlib import Path
from uuid import UUID

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security.auth import get_current_user
from app.db.session import get_db
from app.models import Document, User
from app.schemas.document import (
    DocumentResponse,
    DocumentUpdate,
)
from app.services.document_processing import (
    process_document,
    process_document_in_background,
)

from app.services.document_storage import (
    STORAGE_ROOT,
    delete_document_file,
    save_document_file,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


ALLOWED_FILE_TYPES = {
    "application/pdf": "pdf",
}


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    original_filename = file.filename or "document"

    mime_type = file.content_type or ""

    if mime_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents are currently supported.",
        )

    storage_path, file_size = await save_document_file(file)

    document = Document(
        user_id=current_user.id,
        name=original_filename,
        original_filename=original_filename,
        file_type=ALLOWED_FILE_TYPES[mime_type],
        mime_type=mime_type,
        file_size=file_size,
        storage_path=storage_path,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    background_tasks.add_task(
        process_document_in_background,
        document.id,
    )

    return document


@router.get(
    "/user",
    response_model=list[DocumentResponse],
)
def get_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DocumentResponse]:
    documents = db.scalars(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.updated_at.desc())
    ).all()

    return list(documents)


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return document


@router.get(
    "/{document_id}/file",
)
def get_document_file(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FileResponse:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    file_path = STORAGE_ROOT / document.storage_path

    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found.",
        )

    return FileResponse(
        path=file_path,
        media_type=document.mime_type,
        filename=document.name,
        content_disposition_type="inline",
    )


@router.post(
    "/{document_id}/process",
    response_model=DocumentResponse,
)
def process_document_endpoint(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    if document.status == "processing":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document is already being processed.",
        )

    if document.status == "ready":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document has already been processed.",
        )

    try:
        process_document(
            document,
            db,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document processing failed.",
        ) from error

    return document


@router.patch(
    "/{document_id}",
    response_model=DocumentResponse,
)
def update_document(
    document_id: UUID,
    document_data: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    update_data = document_data.model_dump(exclude_unset=True)

    if "name" in update_data:
        new_name = update_data["name"].strip()

        if not new_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document name cannot be empty.",
            )

        if "." in new_name:
            extension = new_name.rsplit(".", 1)[1].lower()

            if extension != document.file_type.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Document name must use the .{document.file_type} "
                        "extension."
                    ),
                )

        update_data["name"] = new_name

    for field, value in update_data.items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)

    return document


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    delete_document_file(document.storage_path)

    db.delete(document)
    db.commit()