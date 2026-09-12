from unittest.mock import AsyncMock, patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_test_user() -> tuple[str, str]:
    email = f"ai-user-{uuid4()}@lifeos.local"
    password = "TestPassword123!"

    response = client.post(
        "/api/users",
        json={
            "email": email,
            "name": "AI Test User",
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


@patch(
    "app.api.routes.ai.generate_response",
    new_callable=AsyncMock,
)
def test_create_ai_conversation(mock_generate_response: AsyncMock) -> None:
    user_id, access_token = create_test_user()

    mock_generate_response.return_value = (
        "Here is a simple plan for your day."
    )

    response = client.post(
        "/api/ai/chat",
        headers=auth_headers(access_token),
        json={
            "message": "Help me plan my day.",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["conversation_id"]
    assert data["message_id"]
    assert data["role"] == "assistant"
    assert data["content"] == "Here is a simple plan for your day."

    conversations_response = client.get(
        "/api/ai/conversations",
        headers=auth_headers(access_token),
    )

    assert conversations_response.status_code == 200

    conversations = conversations_response.json()

    assert len(conversations) == 1
    assert conversations[0]["id"] == data["conversation_id"]
    assert conversations[0]["user_id"] == user_id
    assert conversations[0]["title"] == "Help me plan my day."


@patch(
    "app.api.routes.ai.generate_response",
    new_callable=AsyncMock,
)
def test_get_conversation_messages(
    mock_generate_response: AsyncMock,
) -> None:
    _, access_token = create_test_user()

    mock_generate_response.return_value = "Start with your most important task."

    chat_response = client.post(
        "/api/ai/chat",
        headers=auth_headers(access_token),
        json={
            "message": "How should I start my day?",
        },
    )

    assert chat_response.status_code == 200

    conversation_id = chat_response.json()["conversation_id"]

    response = client.get(
        f"/api/ai/conversations/{conversation_id}/messages",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 200

    messages = response.json()

    assert len(messages) == 2

    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "How should I start my day?"

    assert messages[1]["role"] == "assistant"
    assert messages[1]["content"] == (
        "Start with your most important task."
    )

    assert messages[0]["conversation_id"] == conversation_id
    assert messages[1]["conversation_id"] == conversation_id


@patch(
    "app.api.routes.ai.generate_response",
    new_callable=AsyncMock,
)
def test_continue_existing_conversation(
    mock_generate_response: AsyncMock,
) -> None:
    _, access_token = create_test_user()

    mock_generate_response.side_effect = [
        "Start with your most important task.",
        "Then work on your next priority.",
    ]

    first_response = client.post(
        "/api/ai/chat",
        headers=auth_headers(access_token),
        json={
            "message": "How should I start my day?",
        },
    )

    assert first_response.status_code == 200

    conversation_id = first_response.json()["conversation_id"]

    second_response = client.post(
        "/api/ai/chat",
        headers=auth_headers(access_token),
        json={
            "message": "What should I do after that?",
            "conversation_id": conversation_id,
        },
    )

    assert second_response.status_code == 200

    second_data = second_response.json()

    assert second_data["conversation_id"] == conversation_id
    assert second_data["content"] == (
        "Then work on your next priority."
    )

    messages_response = client.get(
        f"/api/ai/conversations/{conversation_id}/messages",
        headers=auth_headers(access_token),
    )

    assert messages_response.status_code == 200

    messages = messages_response.json()

    assert len(messages) == 4

    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "How should I start my day?"

    assert messages[1]["role"] == "assistant"
    assert messages[1]["content"] == (
        "Start with your most important task."
    )

    assert messages[2]["role"] == "user"
    assert messages[2]["content"] == "What should I do after that?"

    assert messages[3]["role"] == "assistant"
    assert messages[3]["content"] == (
        "Then work on your next priority."
    )


def test_ai_conversations_require_authentication() -> None:
    conversations_response = client.get(
        "/api/ai/conversations",
    )

    assert conversations_response.status_code == 401


def test_ai_messages_require_authentication() -> None:
    conversation_id = uuid4()

    response = client.get(
        f"/api/ai/conversations/{conversation_id}/messages",
    )

    assert response.status_code == 401


@patch(
    "app.api.routes.ai.generate_response",
    new_callable=AsyncMock,
)
def test_user_cannot_access_another_users_conversation(
    mock_generate_response: AsyncMock,
) -> None:
    _, first_access_token = create_test_user()
    _, second_access_token = create_test_user()

    mock_generate_response.return_value = "Private response."

    chat_response = client.post(
        "/api/ai/chat",
        headers=auth_headers(first_access_token),
        json={
            "message": "This conversation is private.",
        },
    )

    assert chat_response.status_code == 200

    conversation_id = chat_response.json()["conversation_id"]

    response = client.get(
        f"/api/ai/conversations/{conversation_id}/messages",
        headers=auth_headers(second_access_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Conversation not found"


def test_nonexistent_conversation_returns_404() -> None:
    _, access_token = create_test_user()

    nonexistent_id = uuid4()

    response = client.get(
        f"/api/ai/conversations/{nonexistent_id}/messages",
        headers=auth_headers(access_token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Conversation not found"