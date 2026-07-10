"""SQLAlchemy engine factory — PostgreSQL-ready."""

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.core.config import get_settings


def create_db_engine() -> Engine:
    """Create database engine from DATABASE_URL setting."""
    settings = get_settings()
    connect_args = {}
    if settings.database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

    return create_engine(settings.database_url, connect_args=connect_args)
