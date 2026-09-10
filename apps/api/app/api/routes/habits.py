from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security.auth import get_current_user
from app.db.session import get_db
from app.models import Habit, HabitCompletion, User
from app.schemas.habit import (
    HabitCompletionResponse,
    HabitCreate,
    HabitProgressResponse,
    HabitResponse,
    HabitUpdate,
)

router = APIRouter(
    prefix="/habits",
    tags=["Habits"],
)


@router.post(
    "",
    response_model=HabitResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitResponse:
    habit = Habit(
        user_id=current_user.id,
        name=habit_data.name,
        description=habit_data.description,
        frequency=habit_data.frequency,
        target_per_week=habit_data.target_per_week,
    )

    db.add(habit)
    db.commit()
    db.refresh(habit)

    return habit


@router.get(
    "/user",
    response_model=list[HabitResponse],
)
def get_user_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[HabitResponse]:
    habits = db.scalars(
        select(Habit)
        .where(Habit.user_id == current_user.id)
        .order_by(Habit.created_at.desc())
    ).all()

    return list(habits)


@router.get(
    "/{habit_id}",
    response_model=HabitResponse,
)
def get_habit(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitResponse:
    habit = db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id,
        )
    )

    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found.",
        )

    return habit

@router.get(
    "/{habit_id}/completions",
    response_model=list[HabitCompletionResponse],
)
def get_habit_completions(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[HabitCompletionResponse]:
    habit = db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id,
        )
    )

    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found.",
        )

    completions = db.scalars(
        select(HabitCompletion)
        .where(HabitCompletion.habit_id == habit.id)
        .order_by(HabitCompletion.completed_date.desc())
    ).all()

    return list(completions)

@router.post(
    "/{habit_id}/complete",
    response_model=HabitCompletionResponse,
    status_code=status.HTTP_201_CREATED,
)
def complete_habit(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitCompletionResponse:
    habit = db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id,
        )
    )

    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found.",
        )

    today = date.today()

    existing_completion = db.scalar(
        select(HabitCompletion).where(
            HabitCompletion.habit_id == habit.id,
            HabitCompletion.completed_date == today,
        )
    )

    if existing_completion is not None:
        return existing_completion

    completion = HabitCompletion(
        habit_id=habit.id,
        completed_date=today,
    )

    db.add(completion)
    db.commit()
    db.refresh(completion)

    return completion

@router.get(
    "/{habit_id}/progress",
    response_model=HabitProgressResponse,
)
def get_habit_progress(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitProgressResponse:
    habit = db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id,
        )
    )

    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found.",
        )

    completions = db.scalars(
        select(HabitCompletion.completed_date)
        .where(HabitCompletion.habit_id == habit.id)
        .order_by(HabitCompletion.completed_date.desc())
    ).all()

    completion_dates = list(completions)

    today = date.today()

    # Monday = start of the current week.
    week_start = today - timedelta(days=today.weekday())

    completions_this_week = sum(
        1
        for completed_date in completion_dates
        if week_start <= completed_date <= today
    )

    today_completed = today in completion_dates

    weekly_progress_percent = min(
        100,
        round(
            completions_this_week / habit.target_per_week * 100
        ),
    )

    completion_date_set = set(completion_dates)

    current_streak = 0
    streak_date = today

    while streak_date in completion_date_set:
        current_streak += 1
        streak_date -= timedelta(days=1)

    longest_streak = 0
    running_streak = 0
    previous_date = None

    for completed_date in sorted(completion_date_set):
        if (
            previous_date is not None
            and completed_date == previous_date + timedelta(days=1)
        ):
            running_streak += 1
        else:
            running_streak = 1

        longest_streak = max(longest_streak, running_streak)
        previous_date = completed_date

    return HabitProgressResponse(
        habit_id=habit.id,
        today_completed=today_completed,
        completions_this_week=completions_this_week,
        target_per_week=habit.target_per_week,
        weekly_progress_percent=weekly_progress_percent,
        current_streak=current_streak,
        longest_streak=longest_streak,
    )

@router.patch(
    "/{habit_id}",
    response_model=HabitResponse,
)
def update_habit(
    habit_id: UUID,
    habit_data: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitResponse:
    habit = db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id,
        )
    )

    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found.",
        )

    update_data = habit_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(habit, field, value)

    db.commit()
    db.refresh(habit)

    return habit


@router.delete(
    "/{habit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_habit(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    habit = db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id,
        )
    )

    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found.",
        )

    db.delete(habit)
    db.commit()
