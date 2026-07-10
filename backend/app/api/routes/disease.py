"""Disease module API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.api.deps import get_disease_service
from app.schemas import DiseaseModelsResponse, DiseasePredictResponse
from app.services.disease_service import DiseaseService

router = APIRouter(prefix="/disease", tags=["disease"])


@router.post("/predict", response_model=DiseasePredictResponse)
async def predict_disease(
    file: UploadFile = File(...),
    model: str | None = Form(default=None),
    service: DiseaseService = Depends(get_disease_service),
) -> DiseasePredictResponse:
    image_bytes = await file.read()
    payload = await service.predict(image_bytes=image_bytes, model_name=model)
    return DiseasePredictResponse.model_validate(payload)


@router.get("/models", response_model=DiseaseModelsResponse)
async def list_disease_models(
    service: DiseaseService = Depends(get_disease_service),
) -> DiseaseModelsResponse:
    payload = await service.list_models()
    return DiseaseModelsResponse.model_validate(payload)
