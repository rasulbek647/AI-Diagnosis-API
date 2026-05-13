from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import AuthLoginIn, AuthRegisterIn, AuthResponse, ProfileUpdateIn, UserOut
from app.services.auth_service import create_access_token, get_user_by_email, hash_password, verify_password

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
def register(payload: AuthRegisterIn, db: Session = Depends(get_db)):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if payload.email.lower() == settings.admin_email:
        raise HTTPException(status_code=403, detail="This email is reserved for main admin")
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role="user",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id, user.role), user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthLoginIn, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")
    # Keep configured admin account in sync even if role was changed earlier.
    if settings.admin_email and user.email == settings.admin_email and user.role != "admin":
        user.role = "admin"
        db.commit()
        db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id, user.role), user=user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: ProfileUpdateIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    next_email = str(payload.email).lower().strip() if payload.email is not None else None
    email_changing = next_email is not None and next_email != user.email
    password_changing = bool(payload.new_password)

    if email_changing or password_changing:
        if not payload.current_password or not verify_password(payload.current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect or missing")

    if payload.full_name is not None:
        name = payload.full_name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Full name cannot be empty")
        user.full_name = name

    if next_email is not None and next_email != user.email:
        if next_email == settings.admin_email and user.email != settings.admin_email:
            raise HTTPException(status_code=403, detail="This email is reserved for main admin")
        if get_user_by_email(db, next_email):
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = next_email

    if payload.new_password is not None:
        if len(payload.new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        user.password_hash = hash_password(payload.new_password)

    db.commit()
    db.refresh(user)
    return user
