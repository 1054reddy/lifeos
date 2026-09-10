from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_test_user() -> tuple[str, str]:
    email = f"habit-user-{uuid4()}@lifeos.local"
    password = "TestPassword123!"

    response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "Habit Test User",
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


def create_test_habit(access_token: str) -> dict:
    response = client.post(
        "/api/habits",
        headers=auth_headers(access_token),
        json={
            "name": "Read",
            "description": "Read for 30 minutes",
            "frequency": "daily",
            "target_per_week": 7,
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_habit() -> None:
    user_id, access_token = create_test_user()

    response = client.post(
        "/api/habits",
        headers=auth_headers(access_token),
        json={
            "name": "Exercise",
            "description": "Workout",
            "frequency": "weekly",
            "target_per_week": 4,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["user_id"] == user_id
    assert data["name"] == "Exercise"
    assert data["description"] == "Workout"
    assert data["frequency"] == "weekly"
    assert data["target_per_week"] == 4
    assert data["is_active"] is True


def test_create_habit_without_auth_returns_401() -> None:
    response = client.post(
        "/api/habits",
        json={
            "name": "Exercise",
            "frequency": "weekly",
            "target_per_week": 4,
        },
    )

    assert response.status_code == 401


def test_get_user_habits() -> None:
    _, access_token = create_test_user()

    for name in ["Read", "Exercise"]:
        response = client.post(
            "/api/habits",
            headers=auth_headers(access_token),
            json={
                "name": name,
                "frequency": "daily",
                "target_per_week": 7,
            },
        )

        assert response.status_code == 201

    response = client.get(
        "/api/habits/user",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert {habit["name"] for habit in data} == {
        "Read",
        "Exercise",
    }


def test_get_habit() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    response = client.get(
        f"/api/habits/{habit['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == habit["id"]
    assert data["name"] == "Read"


def test_user_cannot_access_another_users_habit() -> None:
    user_one_id, user_one_token = create_test_user()
    _, user_two_token = create_test_user()

    habit = create_test_habit(user_one_token)

    assert habit["user_id"] == user_one_id

    response = client.get(
        f"/api/habits/{habit['id']}",
        headers=auth_headers(user_two_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Habit not found."


def test_update_habit() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    response = client.patch(
        f"/api/habits/{habit['id']}",
        headers=auth_headers(access_token),
        json={
            "name": "Read Books",
            "target_per_week": 5,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Read Books"
    assert data["target_per_week"] == 5
    assert data["frequency"] == "daily"


def test_delete_habit() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    response = client.delete(
        f"/api/habits/{habit['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 204

    response = client.get(
        f"/api/habits/{habit['id']}",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 404


def test_invalid_habit_frequency_returns_422() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/habits",
        headers=auth_headers(access_token),
        json={
            "name": "Exercise",
            "frequency": "monthly",
            "target_per_week": 4,
        },
    )

    assert response.status_code == 422


def test_invalid_habit_target_returns_422() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/habits",
        headers=auth_headers(access_token),
        json={
            "name": "Exercise",
            "frequency": "weekly",
            "target_per_week": 8,
        },
    )

    assert response.status_code == 422


def test_complete_habit() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    response = client.post(
        f"/api/habits/{habit['id']}/complete",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 201

    data = response.json()

    assert data["habit_id"] == habit["id"]
    assert "completed_date" in data
    assert "created_at" in data


def test_complete_habit_twice_does_not_create_duplicate() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    first_response = client.post(
        f"/api/habits/{habit['id']}/complete",
        headers=auth_headers(access_token),
    )

    assert first_response.status_code == 201

    first_data = first_response.json()

    second_response = client.post(
        f"/api/habits/{habit['id']}/complete",
        headers=auth_headers(access_token),
    )

    assert second_response.status_code == 201

    second_data = second_response.json()

    assert second_data["id"] == first_data["id"]
    assert second_data["habit_id"] == first_data["habit_id"]
    assert second_data["completed_date"] == first_data["completed_date"]


def test_complete_habit_without_auth_returns_401() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    response = client.post(
        f"/api/habits/{habit['id']}/complete",
    )

    assert response.status_code == 401


def test_user_cannot_complete_another_users_habit() -> None:
    _, user_one_token = create_test_user()
    _, user_two_token = create_test_user()

    habit = create_test_habit(user_one_token)

    response = client.post(
        f"/api/habits/{habit['id']}/complete",
        headers=auth_headers(user_two_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Habit not found."


def test_habit_progress_with_no_completions() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    response = client.get(
        f"/api/habits/{habit['id']}/progress",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["habit_id"] == habit["id"]
    assert data["today_completed"] is False
    assert data["completions_this_week"] == 0
    assert data["target_per_week"] == 7
    assert data["weekly_progress_percent"] == 0
    assert data["current_streak"] == 0
    assert data["longest_streak"] == 0


def test_habit_progress_after_completing_today() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    complete_response = client.post(
        f"/api/habits/{habit['id']}/complete",
        headers=auth_headers(access_token),
    )

    assert complete_response.status_code == 201

    response = client.get(
        f"/api/habits/{habit['id']}/progress",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["today_completed"] is True
    assert data["completions_this_week"] == 1
    assert data["weekly_progress_percent"] == 14
    assert data["current_streak"] == 1
    assert data["longest_streak"] == 1


def test_habit_progress_without_auth_returns_401() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    response = client.get(
        f"/api/habits/{habit['id']}/progress",
    )

    assert response.status_code == 401


def test_user_cannot_view_another_users_habit_progress() -> None:
    _, user_one_token = create_test_user()
    _, user_two_token = create_test_user()

    habit = create_test_habit(user_one_token)

    response = client.get(
        f"/api/habits/{habit['id']}/progress",
        headers=auth_headers(user_two_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Habit not found."


def test_habit_progress_reaches_100_percent_for_target() -> None:
    _, access_token = create_test_user()

    response = client.post(
        "/api/habits",
        headers=auth_headers(access_token),
        json={
            "name": "Exercise",
            "frequency": "weekly",
            "target_per_week": 1,
        },
    )

    assert response.status_code == 201

    habit = response.json()

    complete_response = client.post(
        f"/api/habits/{habit['id']}/complete",
        headers=auth_headers(access_token),
    )

    assert complete_response.status_code == 201

    progress_response = client.get(
        f"/api/habits/{habit['id']}/progress",
        headers=auth_headers(access_token),
    )

    assert progress_response.status_code == 200

    data = progress_response.json()

    assert data["completions_this_week"] == 1
    assert data["target_per_week"] == 1
    assert data["weekly_progress_percent"] == 100


def test_get_habit_completions() -> None:
    _, access_token = create_test_user()

    habit = create_test_habit(access_token)

    complete_response = client.post(
        f"/api/habits/{habit['id']}/complete",
        headers=auth_headers(access_token),
    )

    assert complete_response.status_code == 201

    response = client.get(
        f"/api/habits/{habit['id']}/completions",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["habit_id"] == habit["id"]
    assert "completed_date" in data[0]
    assert "created_at" in data[0]


def test_user_cannot_view_another_users_habit_completions() -> None:
    _, user_one_token = create_test_user()
    _, user_two_token = create_test_user()

    habit = create_test_habit(user_one_token)

    complete_response = client.post(
        f"/api/habits/{habit['id']}/complete",
        headers=auth_headers(user_one_token),
    )

    assert complete_response.status_code == 201

    response = client.get(
        f"/api/habits/{habit['id']}/completions",
        headers=auth_headers(user_two_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Habit not found."
