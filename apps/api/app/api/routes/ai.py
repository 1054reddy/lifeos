from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security.auth import get_current_user
from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    ConversationResponse,
    MessageResponse,
)
from app.services.ai_service import generate_response


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post("/chat", response_model=AIChatResponse)
async def chat(
    request: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Find an existing conversation or create a new one.
    if request.conversation_id:
        conversation = db.scalar(
            select(Conversation).where(
                Conversation.id == request.conversation_id,
                Conversation.user_id == current_user.id,
            )
        )

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
    else:
        conversation = Conversation(
            user_id=current_user.id,
            title=request.message[:50],
        )
        db.add(conversation)
        db.flush()

    # Save the user's message.
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    db.flush()

    # Get the complete conversation history.
    result = db.scalars(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
    )

    messages = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in result
    ]

    # Mark the conversation as recently updated.
    conversation.updated_at = func.now()

    # Commit the user message before making the external API call.
    db.commit()

    try:
        assistant_content = await generate_response(messages)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service is temporarily unavailable",
        )

    # Save the assistant's response.
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_content,
    )

    db.add(assistant_message)

    # Update the conversation activity timestamp again after the
    # assistant response has been generated.
    conversation.updated_at = func.now()

    db.commit()
    db.refresh(assistant_message)

    return AIChatResponse(
        conversation_id=conversation.id,
        message_id=assistant_message.id,
        role=assistant_message.role,
        content=assistant_message.content,
    )


@router.get(
    "/conversations",
    response_model=list[ConversationResponse],
)
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversations = db.scalars(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    ).all()

    return conversations


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def get_conversation_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = db.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    messages = db.scalars(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
    ).all()

    return messages