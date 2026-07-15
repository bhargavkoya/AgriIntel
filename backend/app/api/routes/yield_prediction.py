"""Yield module API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_yield_service
from app.schemas import YieldModelsResponse, YieldPredictRequest, YieldPredictResponse
from app.services.yield_service import YieldService

router = APIRouter(prefix="/yield", tags=["yield"])


@router.post("/predict", response_model=YieldPredictResponse)
async def predict_yield(
    request: YieldPredictRequest,
    service: YieldService = Depends(get_yield_service),
) -> YieldPredictResponse:
    if not service.is_loaded:
        raise HTTPException(status_code=503, detail=f"Yield models not available: {service.status['message']}")

    try:
        payload = await service.predict(request_data=request.model_dump(), model_key=request.model)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return YieldPredictResponse.model_validate(payload)


@router.get("/models", response_model=YieldModelsResponse)
async def list_yield_models(
    service: YieldService = Depends(get_yield_service),
) -> YieldModelsResponse:
    payload = await service.list_models()
    return YieldModelsResponse.model_validate(payload)
