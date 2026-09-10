from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_test_user() -> tuple[str, str]:
    email = f"note-user-{uuid4()}@lifeos.local"
    password = "TestPassword123!"

    response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "Note Test User",
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


def create_test_note(access_token: str) -> dict:
    response = client.post(
        "/api/notes",
        headers=auth_headers(access_token),
        json={
            "title": "Test Note",
            "content": "Test note content",
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_note() -> None:
    user_id, access_token = create_test_user()

    response = client.post(
        "/api/notes",
        headers=auth_headers(access_token),
        json={
            "title": "Project Ideas",
            "content": "Build an AI productivity workspace.",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["user_id"] == user_id
    assert data["title"] == "Project Ideas"
    assert data["content"] == "Build an AI productivity workspace."
    assert data["is_pinned"] is False


def test_create_note_without_auth_returns_401() -> None:
    response = client.post(
        "/api/notes",
        json={
            "title": "Unauthorized Note",
            "content": "Should not be created.",
        },
    )

    assert response.status_code == 401


def test_create_note_with_empty_content() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/notes",
        headers=auth_headers(access_token),
        json={
            "title": "Empty Note",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Empty Note"
    assert data["content"] == ""
    assert data["is_pinned"] is False


def test_get_user_notes() -> None:
    _, access_token = create_test_user()

    for title in ["First Note", "Second Note"]:
        response = client.post(
            "/api/notes",
            headers=auth_headers(access_token),
            json={
                "title": title,
                "content": f"Content for {title}",
            },
        )

        assert response.status_code == 201

    response = client.get(
        "/api/notes/user",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert {note["title"] for note in data} == {
        "First Note",
        "Second Note",
    }


def test_get_note() -> None:
    _, access_token = create_test_user()

    note = create_test_note(access_token)

    response = client.get(
        f"/api/notes/{note['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == note["id"]
    assert data["title"] == "Test Note"
    assert data["content"] == "Test note content"


def test_user_cannot_access_another_users_note() -> None:
    user_one_id, user_one_token = create_test_user()
    _, user_two_token = create_test_user()

    note = create_test_note(user_one_token)

    assert note["user_id"] == user_one_id

    response = client.get(
        f"/api/notes/{note['id']}",
        headers=auth_headers(user_two_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Note not found."


def test_update_note() -> None:
    _, access_token = create_test_user()

    note = create_test_note(access_token)

    response = client.patch(
        f"/api/notes/{note['id']}",
        headers=auth_headers(access_token),
        json={
            "title": "Updated Note",
            "content": "Updated content.",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Updated Note"
    assert data["content"] == "Updated content."
    assert data["is_pinned"] is False


def test_pin_note() -> None:
    _, access_token = create_test_user()

    note = create_test_note(access_token)

    response = client.patch(
        f"/api/notes/{note['id']}",
        headers=auth_headers(access_token),
        json={
            "is_pinned": True,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == note["id"]
    assert data["is_pinned"] is True


def test_delete_note() -> None:
    _, access_token = create_test_user()

    note = create_test_note(access_token)

    response = client.delete(
        f"/api/notes/{note['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 204

    response = client.get(
        f"/api/notes/{note['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 404


def test_invalid_note_title_returns_422() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/notes",
        headers=auth_headers(access_token),
        json={
            "title": "",
            "content": "Invalid title.",
        },
    )

    assert response.status_code == 422