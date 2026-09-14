from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.services.document_storage import STORAGE_ROOT


client = TestClient(app)


PDF_CONTENT = b"%PDF-1.4\nLifeOS test PDF\n%%EOF"


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
                PDF_CONTENT,
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
                PDF_CONTENT,
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
    assert data["file_size"] == len(PDF_CONTENT)
    assert data["status"] == "uploaded"

    storage_path = data["storage_path"]

    assert storage_path.startswith("documents/")
    assert storage_path.endswith(".pdf")

    stored_file = STORAGE_ROOT / storage_path

    assert stored_file.exists()
    assert stored_file.is_file()
    assert stored_file.read_bytes() == PDF_CONTENT


def test_create_document_without_auth_returns_401() -> None:
    response = client.post(
        "/api/documents",
        files={
            "file": (
                "example.pdf",
                PDF_CONTENT,
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
                    PDF_CONTENT,
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