"""Uploaded file repository — Phase 3 implementation."""

import logging

logger = logging.getLogger(__name__)


class FileRepository:
    """CRUD operations for uploaded file records."""

    async def save(self, filename: str, content: bytes, module: str) -> str:
        """Save uploaded file to disk and record metadata. Implemented in Phase 3."""
        raise NotImplementedError("FileRepository.save() — Phase 3")

    async def get(self, file_id: int) -> dict | None:
        """Retrieve file metadata by ID. Implemented in Phase 3."""
        raise NotImplementedError("FileRepository.get() — Phase 3")
