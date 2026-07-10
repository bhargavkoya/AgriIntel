"""Database session management."""

from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.database.engine import create_db_engine

_engine = None
_SessionLocal = None


def get_session_factory() -> sessionmaker[Session]:
    """Lazy-initialize session factory."""
    global _engine, _SessionLocal
    if _SessionLocal is None:
        _engine = create_db_engine()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session."""
    session_factory = get_session_factory()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
