"""Soil health advisor service — Phase 3 implementation."""

import logging

logger = logging.getLogger(__name__)


class AdvisorService:
    """Orchestrates the 3-layer soil health advisory pipeline."""

    def __init__(self) -> None:
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    async def load(self) -> None:
        """Load rules, RF model, encoders, and prompt at startup. Implemented in Phase 3."""
        logger.info("AdvisorService.load() — Phase 3 stub")

    async def recommend(self, request_data: dict, generate_llm: bool = True) -> dict:
        """Run full advisory pipeline. Implemented in Phase 3."""
        raise NotImplementedError("AdvisorService.recommend() — Phase 3")

    async def list_languages(self) -> dict:
        """Return supported advisory languages. Implemented in Phase 3."""
        raise NotImplementedError("AdvisorService.list_languages() — Phase 3")
