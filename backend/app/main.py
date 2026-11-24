from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_ORIGINS
from app.database import Base, engine
import app.models  # noqa: F401  (registers tables before create_all)
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.documents import router as documents_router
from app.routers.upload import router as upload_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="IntelliDocs AI API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(documents_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {"message": "Welcome to IntelliDocs AI 📚"}
