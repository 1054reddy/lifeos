import httpx

from app.core.config import settings


LIFEOS_SYSTEM_PROMPT = (
    "You are LifeOS, an AI productivity assistant. "
    "Help the user manage tasks, habits, notes, planning, "
    "calendar activities, goals, and personal productivity. "
    "Be concise, practical, and helpful."
)


async def generate_response(messages: list[dict[str, str]]) -> str:
    ollama_messages = [
        {
            "role": "system",
            "content": LIFEOS_SYSTEM_PROMPT,
        },
        *messages,
    ]

    payload = {
        "model": settings.ollama_model,
        "messages": ollama_messages,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.ollama_base_url}/api/chat",
            json=payload,
        )

    response.raise_for_status()

    data = response.json()

    return data["message"]["content"]