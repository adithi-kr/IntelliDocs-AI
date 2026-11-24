import os

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import DOWNLOAD_DIR, UPLOAD_DIR
from app.core.deps import get_current_user
from app.crud import (
    delete_document,
    get_document_by_id,
    get_documents,
    search_documents,
)
from app.database import get_db
from app.models.user import User
from app.services.pdf_generator import generate_notes_pdf

router = APIRouter(tags=["documents"])


def stored_file_path(document) -> str:
    """Where the original upload for a document lives on disk."""
    return os.path.join(UPLOAD_DIR, f"{document.id}_{document.filename}")


def serialize(document, full: bool = False) -> dict:
    data = {
        "id": document.id,
        "filename": document.filename,
        "category": document.category,
        "subject": document.subject,
        "summary": document.summary,
        "tags": document.tags,
        "pages": document.pages or 0,
    }
    if full:
        data.update(
            {
                "notes": document.notes,
                "key_points": document.key_points,
                "viva_questions": document.viva_questions,
                "mcqs": document.mcqs,
            }
        )
    return data


def get_owned_document(document_id: int, db: Session, user: User):
    document = get_document_by_id(db, document_id, user.id)
    if not document:
        raise HTTPException(404, "Document not found.")
    return document


@router.get("/documents")
def list_documents(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return [serialize(d) for d in get_documents(db, user.id)]


@router.get("/documents/{document_id}")
def get_single_document(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return serialize(get_owned_document(document_id, db, user), full=True)


@router.get("/search")
def search(
    keyword: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return [serialize(d) for d in search_documents(db, keyword.strip(), user.id)]


@router.delete("/documents/{document_id}")
def remove_document(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = get_owned_document(document_id, db, user)

    file_path = stored_file_path(document)
    if os.path.exists(file_path):
        os.remove(file_path)

    delete_document(db, document)
    return {"message": "Document deleted successfully"}


@router.get("/documents/{document_id}/download-notes")
def download_notes(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = get_owned_document(document_id, db, user)

    base_name = os.path.splitext(document.filename)[0]
    output_path = os.path.join(DOWNLOAD_DIR, f"{document.id}_{base_name}_notes.pdf")

    generate_notes_pdf(document, output_path)

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename=f"{base_name}_notes.pdf",
    )


@router.get("/dashboard-stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    documents = get_documents(db, user.id)

    return {
        "documents": len(documents),
        "subjects": len({d.subject for d in documents if d.subject}),
        "categories": len({d.category for d in documents if d.category}),
        "pages": sum(d.pages or 0 for d in documents),
    }
