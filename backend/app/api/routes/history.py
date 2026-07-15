"""Prediction history API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_prediction_repository
from app.repositories.prediction_repository import PredictionRepository
from app.schemas import HistoryListResponse

router = APIRouter(tags=["history"])


@router.get("/history", response_model=HistoryListResponse)
async def get_history(
    module: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    repository: PredictionRepository = Depends(get_prediction_repository),
) -> HistoryListResponse:
    payload = await repository.list(module=module, page=page, page_size=page_size)
    return HistoryListResponse.model_validate(payload)
