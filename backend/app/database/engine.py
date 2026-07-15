"""SQLAlchemy engine factory — PostgreSQL-ready."""

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.core.config import get_settings


def _resolve_database_url(database_url: str, repo_root) -> str:
    """Anchor a relative sqlite:///./... URL to the repo root.

    Without this, the DB file location depends on the process's current
    working directory (backend/ when run via uvicorn, repo root in tests).
    """
    prefix = "sqlite:///./"
    if not database_url.startswith(prefix):
        return database_url

    absolute_path = repo_root / database_url.removeprefix(prefix)
    absolute_path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{absolute_path}"


def create_db_engine() -> Engine:
    """Create database engine from DATABASE_URL setting."""
    settings = get_settings()
    database_url = _resolve_database_url(settings.database_url, settings.repo_root)

    connect_args = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

    return create_engine(database_url, connect_args=connect_args)
