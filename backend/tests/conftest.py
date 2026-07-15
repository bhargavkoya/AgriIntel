"""Shared pytest fixtures.

Sets DATABASE_URL to a throwaway temp file *before* any test module imports
app.main (whose module-level get_settings() call is cached for the whole
process) so tests never read or write the real data/agriintel.db.
"""

import os
import tempfile
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

_TEST_DB_PATH = Path(tempfile.mkdtemp(prefix="agriintel-test-db-")) / "test.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_TEST_DB_PATH.as_posix()}")

from app import models  # noqa: E402,F401 - registers ORM models on Base.metadata
from app.database.base import Base  # noqa: E402


@pytest.fixture
def db_session_factory(tmp_path):
    """Isolated SQLite-backed session factory so tests never touch the real DB."""
    engine = create_engine(f"sqlite:///{tmp_path}/test.db", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)
