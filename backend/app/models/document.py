from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )
    filename = Column(String)
    category = Column(String)
    subject = Column(String)
    summary = Column(Text)
    notes = Column(Text)
    key_points = Column(Text)
    viva_questions = Column(Text)
    mcqs = Column(Text)
    tags = Column(Text)
    pages = Column(Integer)
    content = Column(Text)
