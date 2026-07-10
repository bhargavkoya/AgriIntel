"""Advisor module API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_advisor_service
from app.schemas import AdvisorLanguagesResponse, AdvisorRecommendRequest, AdvisorRecommendResponse
from app.services.advisor_service import AdvisorService

router = APIRouter(prefix="/advisor", tags=["advisor"])


@router.post("/recommend", response_model=AdvisorRecommendResponse)
async def recommend(
    request: AdvisorRecommendRequest,
    service: AdvisorService = Depends(get_advisor_service),
) -> AdvisorRecommendResponse:
    payload = await service.recommend(
        request_data=request.model_dump(),
        generate_llm=request.generate_llm,
    )
    return AdvisorRecommendResponse.model_validate(payload)


@router.get("/languages", response_model=AdvisorLanguagesResponse)
async def list_languages(
    service: AdvisorService = Depends(get_advisor_service),
) -> AdvisorLanguagesResponse:
    payload = await service.list_languages()
    return AdvisorLanguagesResponse.model_validate(payload)
