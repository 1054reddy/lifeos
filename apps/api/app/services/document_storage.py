import uuid
from pathlib import Path

from fastapi import UploadFile


STORAGE_ROOT = Path(__file__).resolve().parents[2] / "storage"
DOCUMENT_STORAGE_DIR = STORAGE_ROOT / "documents"


def ensure_document_storage() -> None:
    DOCUMENT_STORAGE_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


def generate_storage_filename(original_filename: str) -> str:
    extension = Path(original_filename).suffix.lower()

    return f"{uuid.uuid4()}{extension}"


async def save_document_file(
    file: UploadFile,
) -> tuple[str, int]:
    ensure_document_storage()

    storage_filename = generate_storage_filename(
        file.filename or "document",
    )

    storage_path = DOCUMENT_STORAGE_DIR / storage_filename

    file_size = 0

    with storage_path.open("wb") as destination:
        while chunk := await file.read(1024 * 1024):
            destination.write(chunk)
            file_size += len(chunk)

    return (
        str(storage_path.relative_to(STORAGE_ROOT)),
        file_size,
    )


def delete_document_file(storage_path: str) -> None:
    file_path = STORAGE_ROOT / storage_path

    if file_path.exists():
        file_path.unlink()