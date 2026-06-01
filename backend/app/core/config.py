import os

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "AI Diagnosis API"
    jwt_secret: str = "please-change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_hours: int = 2160  # 90 days
    refresh_token_expire_days: int = 730  # 2 years — session until admin deactivates
    database_url: str = "sqlite:///./medai.db"
    cors_origins: list[str] = ["*"]
    admin_email: str = "admin123@gmail.com"
    admin_password: str = "admin123"
    admin_full_name: str = "Main Admin"


def _normalize_database_url(url: str) -> str:
    """Render Postgres beradi: postgres://... — SQLAlchemy uchun postgresql:// kerak."""
    u = url.strip()
    if u.startswith("postgres://"):
        return "postgresql://" + u[len("postgres://") :]
    return u


def _load_settings() -> Settings:
    cors_raw = os.getenv("CORS_ORIGINS", "*")
    cors = [item.strip() for item in cors_raw.split(",") if item.strip()]
    raw_db = os.getenv("DATABASE_URL", "sqlite:///./medai.db")
    database_url = _normalize_database_url(raw_db) if raw_db else "sqlite:///./medai.db"
    return Settings(
        app_name=os.getenv("APP_NAME", "AI Diagnosis API"),
        jwt_secret=os.getenv("JWT_SECRET", "please-change-this-secret"),
        access_token_expire_hours=int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "2160")),
        refresh_token_expire_days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "730")),
        database_url=database_url,
        cors_origins=cors or ["*"],
        admin_email=os.getenv("ADMIN_EMAIL", "admin123@gmail.com").strip().lower(),
        admin_password=os.getenv("ADMIN_PASSWORD", "admin123").strip(),
        admin_full_name=os.getenv("ADMIN_FULL_NAME", "Main Admin").strip() or "Main Admin",
    )


settings = _load_settings()
