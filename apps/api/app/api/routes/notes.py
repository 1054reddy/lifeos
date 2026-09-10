from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security.auth import get_current_user
from app.db.session import get_db
from app.models import Note, User
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate


router = APIRouter(
    prefix="/notes",
    tags=["Notes"],
)


@router.post(
    "",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteResponse:
    note = Note(
        user_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return note


@router.get(
    "/user",
    response_model=list[NoteResponse],
)
def get_user_notes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[NoteResponse]:
    notes = db.scalars(
        select(Note)
        .where(Note.user_id == current_user.id)
        .order_by(
            Note.is_pinned.desc(),
            Note.updated_at.desc(),
        )
    ).all()

    return list(notes)


@router.get(
    "/{note_id}",
    response_model=NoteResponse,
)
def get_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteResponse:
    note = db.scalar(
        select(Note).where(
            Note.id == note_id,
            Note.user_id == current_user.id,
        )
    )

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found.",
        )

    return note


@router.patch(
    "/{note_id}",
    response_model=NoteResponse,
)
def update_note(
    note_id: UUID,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteResponse:
    note = db.scalar(
        select(Note).where(
            Note.id == note_id,
            Note.user_id == current_user.id,
        )
    )

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found.",
        )

    update_data = note_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)

    return note


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    note = db.scalar(
        select(Note).where(
            Note.id == note_id,
            Note.user_id == current_user.id,
        )
    )

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found.",
        )

    db.delete(note)
    db.commit()