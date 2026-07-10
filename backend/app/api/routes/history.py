"""Prediction history API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas import HistoryListResponse

router = APIRouter(tags=["history"])


@router.get("/history", response_model=HistoryListResponse)
async def get_history(
    module: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> HistoryListResponse:
    # Persistence wiring lands in sub-phase 3.3.
    return HistoryListResponse(
        items=[],
        total=0,
        page=page,
        page_size=page_size,
    )
