"""Disease module API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import UnidentifiedImageError

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
    if not service.is_loaded:
        raise HTTPException(status_code=503, detail=f"Disease models not available: {service.status['message']}")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        payload = await service.predict(image_bytes=image_bytes, model_name=model)
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Invalid or unsupported image file") from exc

    return DiseasePredictResponse.model_validate(payload)


@router.get("/models", response_model=DiseaseModelsResponse)
async def list_disease_models(
    service: DiseaseService = Depends(get_disease_service),
) -> DiseaseModelsResponse:
    payload = await service.list_models()
    return DiseaseModelsResponse.model_validate(payload)
