"""Yield prediction service — Phase 3 implementation."""

import logging

logger = logging.getLogger(__name__)


class YieldService:
    """Orchestrates crop yield prediction inference."""

    def __init__(self) -> None:
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    async def load(self) -> None:
        """Load sklearn pipelines and models at startup. Implemented in Phase 3."""
        logger.info("YieldService.load() — Phase 3 stub")

    async def predict(self, request_data: dict, model_key: str | None = None) -> dict:
        """Run yield prediction. Implemented in Phase 3."""
        raise NotImplementedError("YieldService.predict() — Phase 3")

    async def list_models(self) -> dict:
        """Return available models and test metrics. Implemented in Phase 3."""
        raise NotImplementedError("YieldService.list_models() — Phase 3")
