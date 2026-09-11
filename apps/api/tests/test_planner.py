from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_test_user() -> tuple[str, str]:
    email = f"planner-user-{uuid4()}@lifeos.local"
    password = "TestPassword123!"

    response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "Planner Test User",
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


def create_test_planner_block(access_token: str) -> dict:
    response = client.post(
        "/api/planner",
        headers=auth_headers(access_token),
        json={
            "title": "Test Planner Block",
            "description": "Test planner block description.",
            "planned_date": "2026-09-12",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "block_type": "focus",
        },
    )

    assert response.status_code == 201

    return response.json()

def test_create_planner_block() -> None:
    user_id, access_token = create_test_user()

    response = client.post(
        "/api/planner",
        headers=auth_headers(access_token),
        json={
            "title": "Build LifeOS",
            "description": "Work on the productivity workspace.",
            "planned_date": "2026-09-12",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "block_type": "task",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["user_id"] == user_id
    assert data["title"] == "Build LifeOS"
    assert data["description"] == "Work on the productivity workspace."
    assert data["planned_date"] == "2026-09-12"
    assert data["start_time"] == "10:00:00"
    assert data["end_time"] == "11:30:00"
    assert data["block_type"] == "task"
    assert data["task_id"] is None
    assert data["is_completed"] is False
    assert "id" in data


def test_create_planner_block_without_auth_returns_401() -> None:
    response = client.post(
        "/api/planner",
        json={
            "title": "Unauthenticated planner block",
            "planned_date": "2026-09-12",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "block_type": "focus",
        },
    )

    assert response.status_code == 401

def test_get_user_planner_blocks() -> None:
    _, access_token = create_test_user()

    first_block = client.post(
        "/api/planner",
        headers=auth_headers(access_token),
        json={
            "title": "Morning Focus",
            "planned_date": "2026-09-12",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "block_type": "focus",
        },
    )

    assert first_block.status_code == 201

    second_block = client.post(
        "/api/planner",
        headers=auth_headers(access_token),
        json={
            "title": "Lunch Break",
            "planned_date": "2026-09-12",
            "start_time": "12:00:00",
            "end_time": "13:00:00",
            "block_type": "break",
        },
    )

    assert second_block.status_code == 201

    response = client.get(
        "/api/planner/user?date=2026-09-12",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "Morning Focus"
    assert data[1]["title"] == "Lunch Break"
    assert data[0]["start_time"] == "09:00:00"
    assert data[1]["start_time"] == "12:00:00"    

def test_get_planner_block() -> None:
    _, access_token = create_test_user()

    block = create_test_planner_block(access_token)

    response = client.get(
        f"/api/planner/{block['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == block["id"]
    assert data["title"] == "Test Planner Block"
    assert data["planned_date"] == "2026-09-12"
    assert data["start_time"] == "09:00:00"
    assert data["end_time"] == "10:00:00"
    assert data["block_type"] == "focus"
    assert data["is_completed"] is False    

def test_update_planner_block() -> None:
    _, access_token = create_test_user()

    block = create_test_planner_block(access_token)

    response = client.patch(
        f"/api/planner/{block['id']}",
        headers=auth_headers(access_token),
        json={
            "title": "Updated Planner Block",
            "description": "Updated description.",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "block_type": "task",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == block["id"]
    assert data["title"] == "Updated Planner Block"
    assert data["description"] == "Updated description."
    assert data["start_time"] == "10:00:00"
    assert data["end_time"] == "11:30:00"
    assert data["block_type"] == "task"

def test_update_planner_block_invalid_time_range() -> None:
    _, access_token = create_test_user()

    block = create_test_planner_block(access_token)

    response = client.patch(
        f"/api/planner/{block['id']}",
        headers=auth_headers(access_token),
        json={
            "end_time": "08:00:00",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "start_time must be earlier than end_time."


def test_complete_planner_block() -> None:
    _, access_token = create_test_user()

    block = create_test_planner_block(access_token)

    assert block["is_completed"] is False

    response = client.post(
        f"/api/planner/{block['id']}/complete",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == block["id"]
    assert data["is_completed"] is True


def test_delete_planner_block() -> None:
    _, access_token = create_test_user()

    block = create_test_planner_block(access_token)

    response = client.delete(
        f"/api/planner/{block['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 204

    response = client.get(
        f"/api/planner/{block['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 404


def test_get_planner_block_from_another_user_returns_404() -> None:
    _, first_access_token = create_test_user()
    _, second_access_token = create_test_user()

    block = create_test_planner_block(first_access_token)

    response = client.get(
        f"/api/planner/{block['id']}",
        headers=auth_headers(second_access_token),
    )

    assert response.status_code == 404


def test_update_planner_block_from_another_user_returns_404() -> None:
    _, first_access_token = create_test_user()
    _, second_access_token = create_test_user()

    block = create_test_planner_block(first_access_token)

    response = client.patch(
        f"/api/planner/{block['id']}",
        headers=auth_headers(second_access_token),
        json={
            "title": "Unauthorized Update",
        },
    )

    assert response.status_code == 404


def test_delete_planner_block_from_another_user_returns_404() -> None:
    _, first_access_token = create_test_user()
    _, second_access_token = create_test_user()

    block = create_test_planner_block(first_access_token)

    response = client.delete(
        f"/api/planner/{block['id']}",
        headers=auth_headers(second_access_token),
    )

    assert response.status_code == 404


def test_create_planner_block_with_task() -> None:
    _, access_token = create_test_user()

    task_response = client.post(
        "/api/tasks",
        headers=auth_headers(access_token),
        json={
            "title": "Planner Linked Task",
            "description": "Task linked to a planner block.",
            "status": "todo",
            "priority": "high",
        },
    )

    assert task_response.status_code == 201

    task = task_response.json()

    response = client.post(
        "/api/planner",
        headers=auth_headers(access_token),
        json={
            "title": "Work on Linked Task",
            "planned_date": "2026-09-12",
            "start_time": "14:00:00",
            "end_time": "15:00:00",
            "block_type": "task",
            "task_id": task["id"],
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["task_id"] == task["id"]
    assert data["title"] == "Work on Linked Task"


def test_create_planner_block_with_another_users_task_returns_404() -> None:
    _, first_access_token = create_test_user()
    _, second_access_token = create_test_user()

    task_response = client.post(
        "/api/tasks",
        headers=auth_headers(first_access_token),
        json={
            "title": "Private Task",
            "description": "Belongs to another user.",
            "status": "todo",
            "priority": "medium",
        },
    )

    assert task_response.status_code == 201

    task = task_response.json()

    response = client.post(
        "/api/planner",
        headers=auth_headers(second_access_token),
        json={
            "title": "Unauthorized Linked Block",
            "planned_date": "2026-09-12",
            "start_time": "14:00:00",
            "end_time": "15:00:00",
            "block_type": "task",
            "task_id": task["id"],
        },
    )

    assert response.status_code == 404


def test_create_planner_block_invalid_time_range_returns_422() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/planner",
        headers=auth_headers(access_token),
        json={
            "title": "Invalid Planner Block",
            "planned_date": "2026-09-12",
            "start_time": "10:00:00",
            "end_time": "10:00:00",
            "block_type": "focus",
        },
    )

    assert response.status_code == 422


def test_get_user_planner_blocks_without_auth_returns_401() -> None:
    response = client.get(
        "/api/planner/user?date=2026-09-12",
    )

    assert response.status_code == 401        