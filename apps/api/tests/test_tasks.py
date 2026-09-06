from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_test_user() -> tuple[str, str]:
    email = f"task-user-{uuid4()}@lifeos.local"
    password = "TestPassword123!"

    response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "Task Test User",
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


def test_create_task() -> None:
    user_id, access_token = create_test_user()

    response = client.post(
        "/api/tasks",
        headers=auth_headers(access_token),
        json={
            "title": "Build Tasks API",
            "description": "Implement and test task CRUD operations.",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["user_id"] == user_id
    assert data["title"] == "Build Tasks API"
    assert data["description"] == "Implement and test task CRUD operations."
    assert data["status"] == "todo"
    assert data["priority"] == "medium"
    assert "id" in data


def test_create_task_without_auth_returns_401() -> None:
    response = client.post(
        "/api/tasks",
        json={
            "title": "Unauthenticated task",
        },
    )

    assert response.status_code == 401


def test_get_task() -> None:
    user_id, access_token = create_test_user()

    create_response = client.post(
        "/api/tasks",
        headers=auth_headers(access_token),
        json={
            "title": "Get Task",
        },
    )

    assert create_response.status_code == 201

    task_id = create_response.json()["id"]

    response = client.get(
        f"/api/tasks/{task_id}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == task_id
    assert data["user_id"] == user_id
    assert data["title"] == "Get Task"


def test_get_user_tasks() -> None:
    user_id, access_token = create_test_user()

    for title in ["Task One", "Task Two"]:
        response = client.post(
            "/api/tasks",
            headers=auth_headers(access_token),
            json={
                "title": title,
            },
        )

        assert response.status_code == 201

    response = client.get(
        "/api/tasks/user",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert {task["title"] for task in data} == {
        "Task One",
        "Task Two",
    }


def test_user_cannot_access_another_users_task() -> None:
    user_one_id, user_one_token = create_test_user()
    _, user_two_token = create_test_user()

    create_response = client.post(
        "/api/tasks",
        headers=auth_headers(user_one_token),
        json={
            "title": "Private Task",
        },
    )

    assert create_response.status_code == 201
    task_id = create_response.json()["id"]
    assert create_response.json()["user_id"] == user_one_id

    response = client.get(
        f"/api/tasks/{task_id}",
        headers=auth_headers(user_two_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found."


def test_update_task() -> None:
    user_id, access_token = create_test_user()

    create_response = client.post(
        "/api/tasks",
        headers=auth_headers(access_token),
        json={
            "title": "Original Title",
            "status": "todo",
            "priority": "low",
        },
    )

    assert create_response.status_code == 201

    task_id = create_response.json()["id"]

    response = client.patch(
        f"/api/tasks/{task_id}",
        headers=auth_headers(access_token),
        json={
            "title": "Updated Title",
            "status": "done",
            "priority": "high",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == user_id
    assert data["title"] == "Updated Title"
    assert data["status"] == "done"
    assert data["priority"] == "high"


def test_delete_task() -> None:
    user_id, access_token = create_test_user()

    create_response = client.post(
        "/api/tasks",
        headers=auth_headers(access_token),
        json={
            "title": "Delete Me",
        },
    )

    assert create_response.status_code == 201

    task_id = create_response.json()["id"]
    assert create_response.json()["user_id"] == user_id

    response = client.delete(
        f"/api/tasks/{task_id}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 204
    assert response.content == b""

    get_response = client.get(
        f"/api/tasks/{task_id}",
        headers=auth_headers(access_token),
    )

    assert get_response.status_code == 404
    assert get_response.json()["detail"] == "Task not found."


def test_create_task_rejects_invalid_status() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/tasks",
        headers=auth_headers(access_token),
        json={
            "title": "Invalid Status Task",
            "status": "invalid_status",
        },
    )

    assert response.status_code == 422


def test_create_task_rejects_invalid_priority() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/tasks",
        headers=auth_headers(access_token),
        json={
            "title": "Invalid Priority Task",
            "priority": "urgent",
        },
    )

    assert response.status_code == 422


def test_update_task_rejects_invalid_status() -> None:
    _, access_token = create_test_user()

    create_response = client.post(
        "/api/tasks",
        headers=auth_headers(access_token),
        json={
            "title": "Update Validation Task",
        },
    )

    assert create_response.status_code == 201

    task_id = create_response.json()["id"]

    response = client.patch(
        f"/api/tasks/{task_id}",
        headers=auth_headers(access_token),
        json={
            "status": "invalid_status",
        },
    )

    assert response.status_code == 422
