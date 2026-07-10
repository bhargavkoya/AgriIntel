"""Yield module API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_yield_service
from app.schemas import YieldModelsResponse, YieldPredictRequest, YieldPredictResponse
from app.services.yield_service import YieldService

router = APIRouter(prefix="/yield", tags=["yield"])


@router.post("/predict", response_model=YieldPredictResponse)
async def predict_yield(
    request: YieldPredictRequest,
    service: YieldService = Depends(get_yield_service),
) -> YieldPredictResponse:
    payload = await service.predict(request_data=request.model_dump(), model_key=request.model)
    return YieldPredictResponse.model_validate(payload)


@router.get("/models", response_model=YieldModelsResponse)
async def list_yield_models(
    service: YieldService = Depends(get_yield_service),
) -> YieldModelsResponse:
    payload = await service.list_models()
    return YieldModelsResponse.model_validate(payload)
