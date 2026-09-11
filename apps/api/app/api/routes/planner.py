from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security.auth import get_current_user
from app.db.session import get_db
from app.models import PlannerBlock, Task, User
from app.schemas.planner import (
    PlannerBlockCreate,
    PlannerBlockResponse,
    PlannerBlockUpdate,
)


router = APIRouter(
    prefix="/planner",
    tags=["Planner"],
)


@router.post(
    "",
    response_model=PlannerBlockResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_planner_block(
    block_data: PlannerBlockCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PlannerBlockResponse:
    if block_data.task_id is not None:
        task = db.scalar(
            select(Task).where(
                Task.id == block_data.task_id,
                Task.user_id == current_user.id,
            )
        )

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

    block = PlannerBlock(
        user_id=current_user.id,
        title=block_data.title,
        description=block_data.description,
        planned_date=block_data.planned_date,
        start_time=block_data.start_time,
        end_time=block_data.end_time,
        block_type=block_data.block_type,
        task_id=block_data.task_id,
    )

    db.add(block)
    db.commit()
    db.refresh(block)

    return block

@router.get(
    "/user",
    response_model=list[PlannerBlockResponse],
)
def get_user_planner_blocks(
    date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PlannerBlockResponse]:
    blocks = db.scalars(
        select(PlannerBlock)
        .where(
            PlannerBlock.user_id == current_user.id,
            PlannerBlock.planned_date == date,
        )
        .order_by(
            PlannerBlock.start_time.asc(),
        )
    ).all()

    return list(blocks)

@router.get(
    "/{block_id}",
    response_model=PlannerBlockResponse,
)
def get_planner_block(
    block_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PlannerBlockResponse:
    block = db.scalar(
        select(PlannerBlock).where(
            PlannerBlock.id == block_id,
            PlannerBlock.user_id == current_user.id,
        )
    )

    if block is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner block not found.",
        )

    return block

@router.patch(
    "/{block_id}",
    response_model=PlannerBlockResponse,
)
def update_planner_block(
    block_id: UUID,
    block_data: PlannerBlockUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PlannerBlockResponse:
    block = db.scalar(
        select(PlannerBlock).where(
            PlannerBlock.id == block_id,
            PlannerBlock.user_id == current_user.id,
        )
    )

    if block is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner block not found.",
        )

    update_data = block_data.model_dump(exclude_unset=True)

    new_start_time = update_data.get("start_time", block.start_time)
    new_end_time = update_data.get("end_time", block.end_time)

    if new_start_time >= new_end_time:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_time must be earlier than end_time.",
        )

    if "task_id" in update_data and update_data["task_id"] is not None:
        task = db.scalar(
            select(Task).where(
                Task.id == update_data["task_id"],
                Task.user_id == current_user.id,
            )
        )

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

    for field, value in update_data.items():
        setattr(block, field, value)

    db.commit()
    db.refresh(block)

    return block

@router.delete(
    "/{block_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_planner_block(
    block_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    block = db.scalar(
        select(PlannerBlock).where(
            PlannerBlock.id == block_id,
            PlannerBlock.user_id == current_user.id,
        )
    )

    if block is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner block not found.",
        )

    db.delete(block)
    db.commit()    

@router.post(
    "/{block_id}/complete",
    response_model=PlannerBlockResponse,
)
def complete_planner_block(
    block_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PlannerBlockResponse:
    block = db.scalar(
        select(PlannerBlock).where(
            PlannerBlock.id == block_id,
            PlannerBlock.user_id == current_user.id,
        )
    )

    if block is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner block not found.",
        )

    block.is_completed = True

    db.commit()
    db.refresh(block)

    return block    