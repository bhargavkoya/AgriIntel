"""Uploaded file repository — Phase 3 implementation."""

import logging
from pathlib import Path

from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings
from app.database.session import get_session_factory
from app.models.uploaded_file import UploadedFile

logger = logging.getLogger(__name__)


class FileRepository:
    """CRUD operations for uploaded file records."""

    def __init__(
        self,
        settings: Settings | None = None,
        session_factory: sessionmaker[Session] | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._session_factory = session_factory or get_session_factory()

    async def save(self, filename: str, content: bytes, module: str) -> str:
        """Save uploaded file to disk and record metadata; returns the saved path."""
        upload_dir = self._settings.upload_path
        upload_dir.mkdir(parents=True, exist_ok=True)

        safe_filename = Path(filename).name or "upload"
        destination = upload_dir / f"{module}_{safe_filename}"
        destination.write_bytes(content)

        with self._session_factory() as session:
            record = UploadedFile(filename=filename, path=str(destination))
            session.add(record)
            session.commit()

        return str(destination)

    async def get(self, file_id: int) -> dict | None:
        """Retrieve file metadata by ID."""
        with self._session_factory() as session:
            record = session.get(UploadedFile, file_id)
            if record is None:
                return None

            return {
                "id": record.id,
                "filename": record.filename,
                "path": record.path,
                "uploaded_at": record.uploaded_at.isoformat(),
            }
