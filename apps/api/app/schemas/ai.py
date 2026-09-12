from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AIChatRequest(BaseModel):
    conversation_id: UUID | None = None
    message: str = Field(min_length=1, max_length=10000)


class AIChatResponse(BaseModel):
    conversation_id: UUID
    message_id: UUID
    role: str
    content: str


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    role: str
    content: str
    created_at: datetime