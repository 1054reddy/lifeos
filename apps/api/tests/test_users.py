from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_create_user() -> None:
    email = f"test-{uuid4()}@lifeos.local"

    response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "Test User",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == email
    assert data["name"] == "Test User"
    assert data["is_active"] is True
    assert "id" in data


def test_duplicate_email_returns_409() -> None:
    email = f"duplicate-{uuid4()}@lifeos.local"

    first_response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "First User",
        },
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "Second User",
        },
    )

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == (
        "A user with this email already exists."
    )


def test_invalid_user_payload_returns_422() -> None:
    response = client.post(
        "/api/users",
        json={
            "email": "",
            "name": "",
        },
    )

    assert response.status_code == 422


def test_get_user() -> None:
    email = f"get-{uuid4()}@lifeos.local"

    create_response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "Get User",
        },
    )

    assert create_response.status_code == 201

    user_id = create_response.json()["id"]

    response = client.get(f"/api/users/{user_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == user_id
    assert data["email"] == email
    assert data["name"] == "Get User"
    assert data["is_active"] is True


def test_get_nonexistent_user_returns_404() -> None:
    nonexistent_id = "00000000-0000-0000-0000-000000000000"

    response = client.get(f"/api/users/{nonexistent_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found."
