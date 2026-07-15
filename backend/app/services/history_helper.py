"""Shared best-effort prediction history persistence for the 3 module services."""

import logging

from app.repositories.prediction_repository import PredictionRepository

logger = logging.getLogger(__name__)


async def persist_prediction(
    repository: PredictionRepository,
    module: str,
    model_name: str,
    request_json: dict,
    response_json: dict,
    latency_ms: int,
) -> None:
    """Write a history record. A persistence failure must not fail the request."""
    try:
        await repository.create(
            module=module,
            model_name=model_name,
            request_json=request_json,
            response_json=response_json,
            latency_ms=latency_ms,
        )
    except Exception:  # noqa: BLE001 - best-effort side effect, never fails the caller
        logger.exception("Failed to persist %s prediction history", module)
