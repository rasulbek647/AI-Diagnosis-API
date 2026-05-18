from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime


class AuthLoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthRegisterIn(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserOut


class UserRoleUpdateIn(BaseModel):
    role: str


class AdminUserUpdateIn(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    is_active: bool | None = None
    new_password: str | None = None


class UserEmailUpdateIn(BaseModel):
    email: EmailStr


class ProfileUpdateIn(BaseModel):
    """Own profile: full_name without password; email / new_password need current_password."""

    full_name: str | None = None
    email: EmailStr | None = None
    current_password: str | None = None
    new_password: str | None = None
