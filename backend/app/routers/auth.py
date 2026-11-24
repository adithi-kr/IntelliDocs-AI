from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud import create_user, get_user_by_email
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.services.auth import hash_password, verify_password
from app.services.jwt import create_access_token

router = APIRouter(tags=["auth"])


@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    username = user.username.strip()
    email = user.email.lower()

    if len(username) < 2:
        raise HTTPException(400, "Username must be at least 2 characters.")

    if len(user.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")

    if get_user_by_email(db, email):
        raise HTTPException(400, "Email already registered.")

    create_user(db, username, email, hash_password(user.password))

    return {"message": "Registration successful! Please log in."}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Accept both the original-case and lower-case email so accounts
    # registered before emails were normalised can still log in.
    db_user = get_user_by_email(db, user.email) or get_user_by_email(
        db, user.email.lower()
    )

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(401, "Invalid email or password.")

    token = create_access_token({"sub": str(db_user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user.username,
        "email": db_user.email,
    }


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }
