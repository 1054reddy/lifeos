from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    frequency: str = Field(default="daily", pattern="^(daily|weekly)$")
    target_per_week: int = Field(default=7, ge=1, le=7)


class HabitUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=120,
    )
    description: str | None = None
    frequency: str | None = Field(
        default=None,
        pattern="^(daily|weekly)$",
    )
    target_per_week: int | None = Field(
        default=None,
        ge=1,
        le=7,
    )
    is_active: bool | None = None


class HabitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    description: str | None
    frequency: str
    target_per_week: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class HabitCompletionResponse(BaseModel):
    id: UUID
    habit_id: UUID
    completed_date: date
    created_at: datetime

class HabitProgressResponse(BaseModel):
    habit_id: UUID
    today_completed: bool
    completions_this_week: int
    target_per_week: int
    weekly_progress_percent: int
    current_streak: int
    longest_streak: int