"""Disease detection service — Phase 3 implementation."""

import logging

logger = logging.getLogger(__name__)


class DiseaseService:
    """Orchestrates crop disease detection inference."""

    def __init__(self) -> None:
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    async def load(self) -> None:
        """Load CNN models and configs at startup. Implemented in Phase 3."""
        logger.info("DiseaseService.load() — Phase 3 stub")

    async def predict(self, image_bytes: bytes, model_name: str | None = None) -> dict:
        """Run disease prediction. Implemented in Phase 3."""
        raise NotImplementedError("DiseaseService.predict() — Phase 3")

    async def list_models(self) -> dict:
        """Return available models and metrics. Implemented in Phase 3."""
        raise NotImplementedError("DiseaseService.list_models() — Phase 3")
