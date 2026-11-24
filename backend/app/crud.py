from sqlalchemy.orm import Session

from app.models import Document
from app.models.user import User


def create_document(db: Session, data: dict):
    tags = data.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",")]

    document = Document(
        user_id=data["user_id"],
        filename=data["filename"],
        category=data["category"],
        subject=data["subject"],
        summary=data["summary"],
        notes=data["notes"],
        key_points=data["key_points"],
        viva_questions=data["viva_questions"],
        mcqs=data["mcqs"],
        tags=",".join(str(t).strip() for t in tags if str(t).strip()),
        pages=data["pages"],
        content=data["content"],
    )

    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def get_documents(db: Session, user_id: int):
    return (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.id.desc())
        .all()
    )


def get_document_by_id(db: Session, document_id: int, user_id: int):
    return (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == user_id)
        .first()
    )


def search_documents(db: Session, keyword: str, user_id: int):
    pattern = f"%{keyword}%"
    return (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .filter(
            Document.filename.ilike(pattern)
            | Document.category.ilike(pattern)
            | Document.subject.ilike(pattern)
            | Document.tags.ilike(pattern)
        )
        .order_by(Document.id.desc())
        .all()
    )


def delete_document(db: Session, document):
    db.delete(document)
    db.commit()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, username: str, email: str, password: str):
    user = User(username=username, email=email, password=password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
