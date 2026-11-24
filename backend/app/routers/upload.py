import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pypdf.errors import PdfReadError
from sqlalchemy.orm import Session

from app.config import MAX_UPLOAD_MB, UPLOAD_DIR
from app.core.deps import get_current_user
from app.crud import create_document
from app.database import get_db
from app.models.user import User
from app.routers.documents import serialize, stored_file_path
from app.services.openrouter_service import (
    generate_key_points,
    generate_mcqs,
    generate_notes,
    generate_summary,
    generate_viva,
)
from app.services.pdf_parser import extract_text_from_pdf

router = APIRouter(tags=["upload"])


# A plain `def` (not `async def`) so FastAPI runs this in a worker thread —
# the AI calls below are blocking and would otherwise freeze the whole server.
@router.post("/upload", status_code=201)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # basename() stops names like "../../evil.pdf" escaping the uploads folder
    filename = os.path.basename(file.filename or "").strip()

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    temp_path = os.path.join(UPLOAD_DIR, f"tmp_{uuid.uuid4().hex}.pdf")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if os.path.getsize(temp_path) > MAX_UPLOAD_MB * 1024 * 1024:
            raise HTTPException(400, f"File is larger than {MAX_UPLOAD_MB} MB.")

        try:
            pdf_data = extract_text_from_pdf(temp_path)
        except (PdfReadError, ValueError, OSError):
            raise HTTPException(400, "This file isn't a readable PDF.")

        text = pdf_data["text"].strip()
        pages = pdf_data["pages"]

        if not text:
            raise HTTPException(
                400,
                "No text could be read from this PDF (it may be a scanned image).",
            )

        summary = generate_summary(text)
        notes = generate_notes(text)
        key_points = generate_key_points(text)
        mcqs = generate_mcqs(text)
        viva = generate_viva(text)

        document = create_document(
            db,
            {
                "user_id": user.id,
                "filename": filename,
                "category": summary.get("category") or "Education",
                "subject": summary.get("subject") or "Unknown",
                "summary": summary.get("summary", ""),
                "notes": notes,
                "key_points": key_points,
                "viva_questions": viva,
                "mcqs": mcqs,
                "tags": summary.get("tags", []),
                "pages": pages,
                "content": text,
            },
        )

        # Store as "<id>_<name>" so two uploads with the same name never clash
        os.replace(temp_path, stored_file_path(document))

        ai_ok = bool(summary.get("summary") or notes)

        return {
            "document": serialize(document),
            "ai_status": "ok" if ai_ok else "offline",
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
