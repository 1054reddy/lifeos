from uuid import uuid4

from io import BytesIO
from unittest.mock import patch

from fastapi.testclient import TestClient
from pypdf import PdfWriter

from app.main import app
from app.services.document_storage import STORAGE_ROOT

client = TestClient(app)


def create_valid_pdf() -> bytes:
    writer = PdfWriter()

    writer.add_blank_page(
        width=612,
        height=792,
    )

    output = BytesIO()
    writer.write(output)

    return output.getvalue()


def create_test_user() -> tuple[str, str]:
    email = f"document-user-{uuid4()}@lifeos.local"
    password = "TestPassword123!"

    response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "Document Test User",
            "password": password,
        },
    )

    assert response.status_code == 201

    user_id = response.json()["id"]

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    return user_id, access_token


def auth_headers(access_token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {access_token}",
    }


def create_test_document(access_token: str) -> dict:
    response = client.post(
        "/api/documents",
        headers=auth_headers(access_token),
        files={
            "file": (
                "test.pdf",
                create_valid_pdf(),
                "application/pdf",
            ),
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_document() -> None:
    user_id, access_token = create_test_user()

    response = client.post(
        "/api/documents",
        headers=auth_headers(access_token),
        files={
            "file": (
                "example.pdf",
                create_valid_pdf(),
                "application/pdf",
            ),
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["user_id"] == user_id
    assert data["name"] == "example.pdf"
    assert data["original_filename"] == "example.pdf"
    assert data["file_type"] == "pdf"
    assert data["mime_type"] == "application/pdf"
    assert data["file_size"] == len(create_valid_pdf())
    assert data["status"] == "uploaded"

    storage_path = data["storage_path"]

    assert storage_path.startswith("documents/")
    assert storage_path.endswith(".pdf")

    stored_file = STORAGE_ROOT / storage_path

    assert stored_file.exists()
    assert stored_file.is_file()
    assert stored_file.read_bytes() == create_valid_pdf()


def test_create_document_without_auth_returns_401() -> None:
    response = client.post(
        "/api/documents",
        files={
            "file": (
                "example.pdf",
                create_valid_pdf(),
                "application/pdf",
            ),
        },
    )

    assert response.status_code == 401


def test_create_document_rejects_non_pdf() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/documents",
        headers=auth_headers(access_token),
        files={
            "file": (
                "notes.txt",
                b"plain text",
                "text/plain",
            ),
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Only PDF documents are currently supported."
    )


def test_get_user_documents() -> None:
    _, access_token = create_test_user()

    for filename in ["first.pdf", "second.pdf"]:
        response = client.post(
            "/api/documents",
            headers=auth_headers(access_token),
            files={
                "file": (
                    filename,
                    create_valid_pdf(),
                    "application/pdf",
                ),
            },
        )

        assert response.status_code == 201

    response = client.get(
        "/api/documents/user",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert {document["original_filename"] for document in data} == {
        "first.pdf",
        "second.pdf",
    }


def test_get_document() -> None:
    _, access_token = create_test_user()

    document = create_test_document(access_token)

    response = client.get(
        f"/api/documents/{document['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == document["id"]
    assert data["name"] == "test.pdf"
    assert data["original_filename"] == "test.pdf"


def test_user_cannot_access_another_users_document() -> None:
    user_one_id, user_one_token = create_test_user()
    _, user_two_token = create_test_user()

    document = create_test_document(user_one_token)

    assert document["user_id"] == user_one_id

    response = client.get(
        f"/api/documents/{document['id']}",
        headers=auth_headers(user_two_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Document not found."


def test_update_document() -> None:
    _, access_token = create_test_user()

    document = create_test_document(access_token)

    response = client.patch(
        f"/api/documents/{document['id']}",
        headers=auth_headers(access_token),
        json={
            "name": "Updated Document",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == document["id"]
    assert data["name"] == "Updated Document"
    assert data["original_filename"] == "test.pdf"


def test_update_document_rejects_wrong_extension() -> None:
    _, access_token = create_test_user()

    document = create_test_document(access_token)

    response = client.patch(
        f"/api/documents/{document['id']}",
        headers=auth_headers(access_token),
        json={
            "name": "A3_230001054.txt",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Document name must use the .pdf extension."
    )


def test_delete_document() -> None:
    _, access_token = create_test_user()

    document = create_test_document(access_token)

    stored_file = STORAGE_ROOT / document["storage_path"]

    assert stored_file.exists()

    response = client.delete(
        f"/api/documents/{document['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 204

    assert not stored_file.exists()

    response = client.get(
        f"/api/documents/{document['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 404


def test_get_nonexistent_document() -> None:
    _, access_token = create_test_user()

    document_id = uuid4()

    response = client.get(
        f"/api/documents/{document_id}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 404


def test_process_document() -> None:
    _, access_token = create_test_user()

    with patch(
        "app.api.routes.documents.process_document_in_background",
    ):
        document = create_test_document(access_token)

    def fake_process_document(document, db):
        document.status = "ready"

    with patch(
        "app.api.routes.documents.process_document",
        side_effect=fake_process_document,
    ) as mock_process:
        response = client.post(
            f"/api/documents/{document['id']}/process",
            headers=auth_headers(access_token),
        )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == document["id"]
    assert data["status"] == "ready"

    mock_process.assert_called_once()



def test_process_document_denies_other_user() -> None:
    _, owner_token = create_test_user()
    _, other_user_token = create_test_user()

    document = create_test_document(owner_token)

    with patch(
        "app.api.routes.documents.process_document",
    ) as mock_process:
        response = client.post(
            f"/api/documents/{document['id']}/process",
            headers=auth_headers(other_user_token),
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "Document not found."

    mock_process.assert_not_called()


def test_process_document_returns_404_for_nonexistent_document() -> None:
    _, access_token = create_test_user()

    fake_document_id = "00000000-0000-0000-0000-000000000000"

    with patch(
        "app.api.routes.documents.process_document",
    ) as mock_process:
        response = client.post(
            f"/api/documents/{fake_document_id}/process",
            headers=auth_headers(access_token),
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "Document not found."

    mock_process.assert_not_called()


def test_process_document_rejects_ready_document() -> None:
    _, access_token = create_test_user()

    document = create_test_document(access_token)

    from app.db.session import SessionLocal
    from app.models import Document

    with SessionLocal() as db:
        db_document = db.get(
            Document,
            document["id"],
        )

        assert db_document is not None

        db_document.status = "ready"
        db.commit()

    with patch(
        "app.api.routes.documents.process_document",
    ) as mock_process:
        response = client.post(
            f"/api/documents/{document['id']}/process",
            headers=auth_headers(access_token),
        )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Document has already been processed."
    )

    mock_process.assert_not_called()


def test_process_document_returns_500_when_processing_fails() -> None:
    _, access_token = create_test_user()

    with patch(
        "app.api.routes.documents.process_document_in_background",
    ):
        document = create_test_document(access_token)

    with patch(
        "app.api.routes.documents.process_document",
        side_effect=ValueError("PDF extraction failed."),
    ) as mock_process:
        response = client.post(
            f"/api/documents/{document['id']}/process",
            headers=auth_headers(access_token),
        )

    assert response.status_code == 500

    mock_process.assert_called_once()


def test_process_document_extracts_real_pdf() -> None:
    _, access_token = create_test_user()

    pdf_content = create_valid_pdf()

    with patch(
        "app.api.routes.documents.process_document_in_background",
    ) as mock_background:
        upload_response = client.post(
            "/api/documents",
            headers=auth_headers(access_token),
            files={
                "file": (
                    "real-test.pdf",
                    pdf_content,
                    "application/pdf",
                ),
            },
        )

    assert upload_response.status_code == 201

    document = upload_response.json()

    assert document["id"]
    assert document["status"] == "uploaded"

    mock_background.assert_called_once()