"""Prediction history API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_prediction_repository
from app.repositories.prediction_repository import PredictionRepository
from app.schemas import HistoryItem, HistoryListResponse

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


@router.get("/history/{item_id}", response_model=HistoryItem)
async def get_history_item(
    item_id: int,
    repository: PredictionRepository = Depends(get_prediction_repository),
) -> HistoryItem:
    payload = await repository.get_by_id(item_id)
    if payload is None:
        raise HTTPException(status_code=404, detail=f"History item {item_id} not found")
    return HistoryItem.model_validate(payload)
