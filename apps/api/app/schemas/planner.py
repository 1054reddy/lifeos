from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.planner_enums import PlannerBlockType


class PlannerBlockCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    planned_date: date
    start_time: time
    end_time: time
    block_type: PlannerBlockType = PlannerBlockType.TASK
    task_id: UUID | None = None

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time.")
        return self


class PlannerBlockUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    description: str | None = None
    planned_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    block_type: PlannerBlockType | None = None
    task_id: UUID | None = None
    is_completed: bool | None = None

    @model_validator(mode="after")
    def validate_time_range(self):
        if (
            self.start_time is not None
            and self.end_time is not None
            and self.start_time >= self.end_time
        ):
            raise ValueError("start_time must be earlier than end_time.")
        return self


class PlannerBlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    description: str | None
    planned_date: date
    start_time: time
    end_time: time
    block_type: PlannerBlockType
    task_id: UUID | None
    is_completed: bool
    created_at: datetime
    updated_at: datetime
