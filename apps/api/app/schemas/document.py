from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DocumentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    original_filename: str = Field(min_length=1, max_length=255)
    file_type: str = Field(min_length=1, max_length=50)
    mime_type: str = Field(min_length=1, max_length=100)
    file_size: int = Field(ge=0)
    storage_path: str = Field(min_length=1, max_length=500)


class DocumentUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    original_filename: str
    file_type: str
    mime_type: str
    file_size: int
    storage_path: str
    status: str
    created_at: datetime
    updated_at: datetime