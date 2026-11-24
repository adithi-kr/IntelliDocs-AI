from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud import get_document_by_id
from app.database import get_db
from app.models.user import User
from app.services.openrouter_service import ask_document

router = APIRouter(tags=["chat"])


class ChatMessage(BaseModel):
    role: Literal["user", "ai", "assistant"]
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    history: list[ChatMessage] = []


@router.post("/documents/{document_id}/chat")
def chat_with_document(
    document_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = get_document_by_id(db, document_id, user.id)
    if not document:
        raise HTTPException(404, "Document not found.")

    # Keep the last few turns only, so long chats don't blow the prompt size
    conversation = "".join(
        f"{'User' if m.role == 'user' else 'Assistant'}: {m.content}\n"
        for m in request.history[-10:]
    )

    answer = ask_document(document.content or "", request.question, conversation)

    return {"document_id": document_id, "answer": answer}
