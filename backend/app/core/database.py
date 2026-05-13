from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _migrate_sqlite_disease_columns() -> None:
    """SQLite jadvallarga yangi ustunlar (create_all ALTER qilmaydi)."""
    if not settings.database_url.startswith("sqlite"):
        return
    insp = inspect(engine)
    if not insp.has_table("disease_knowledge"):
        return
    cols = {c["name"] for c in insp.get_columns("disease_knowledge")}
    with engine.begin() as conn:
        if "category" not in cols:
            conn.execute(
                text("ALTER TABLE disease_knowledge ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'general'")
            )
        if "translations" not in cols:
            conn.execute(text("ALTER TABLE disease_knowledge ADD COLUMN translations TEXT DEFAULT '{}'"))


def init_db() -> None:
    # Import models before create_all to ensure metadata is complete.
    from app.models import diagnosis, disease, user  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _migrate_sqlite_disease_columns()
