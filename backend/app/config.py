import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

load_dotenv(os.path.join(BASE_DIR, ".env"))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(BASE_DIR, 'intellidocs.db')}"
)

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
DOWNLOAD_DIR = os.path.join(BASE_DIR, "downloads")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY", "intellidocs_secret_key_change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))

FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://adithi-kr.github.io",  # GitHub Pages build of the frontend
] + [o.strip() for o in os.getenv("EXTRA_ORIGINS", "").split(",") if o.strip()]

MAX_UPLOAD_MB = 25
