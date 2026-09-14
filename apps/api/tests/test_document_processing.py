from pathlib import Path
from unittest.mock import MagicMock, patch

from app.services.document_processing import process_document


def create_mock_document(
    storage_path: str,
) -> MagicMock:
    document = MagicMock()

    document.storage_path = storage_path
    document.status = "uploaded"

    return document


def test_process_document_marks_document_ready(
    tmp_path: Path,
) -> None:
    document = create_mock_document(
        "documents/test.pdf",
    )
    db = MagicMock()

    storage_file = (
        tmp_path / "documents" / "test.pdf"
    )
    storage_file.parent.mkdir(
        parents=True,
        exist_ok=True,
    )
    storage_file.write_bytes(b"test pdf")

    with patch(
        "app.services.document_processing.STORAGE_ROOT",
        tmp_path,
    ), patch(
        "app.services.document_processing.extract_pdf_text",
        return_value="Extracted LifeOS document text.",
    ) as mock_extract:
        result = process_document(
            document,
            db,
        )

    assert result == "Extracted LifeOS document text."
    assert document.status == "ready"

    mock_extract.assert_called_once_with(
        storage_file,
    )

    assert db.commit.call_count == 2
    assert db.refresh.call_count == 2


def test_process_document_marks_document_failed_when_extraction_fails(
    tmp_path: Path,
) -> None:
    document = create_mock_document(
        "documents/test.pdf",
    )
    db = MagicMock()

    storage_file = (
        tmp_path / "documents" / "test.pdf"
    )
    storage_file.parent.mkdir(
        parents=True,
        exist_ok=True,
    )
    storage_file.write_bytes(b"test pdf")

    with patch(
        "app.services.document_processing.STORAGE_ROOT",
        tmp_path,
    ), patch(
        "app.services.document_processing.extract_pdf_text",
        side_effect=ValueError("PDF extraction failed."),
    ):
        try:
            process_document(
                document,
                db,
            )
        except ValueError as error:
            assert str(error) == "PDF extraction failed."
        else:
            raise AssertionError(
                "process_document() should raise the extraction error."
            )

    assert document.status == "failed"

    assert db.commit.call_count == 2
    assert db.refresh.call_count == 2