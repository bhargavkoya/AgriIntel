"""Advisor module API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_advisor_service
from app.integrations.llm.base import LLMProviderError
from app.schemas import AdvisorLanguagesResponse, AdvisorRecommendRequest, AdvisorRecommendResponse
from app.services.advisor_service import AdvisorService

router = APIRouter(prefix="/advisor", tags=["advisor"])


@router.post("/recommend", response_model=AdvisorRecommendResponse)
async def recommend(
    request: AdvisorRecommendRequest,
    service: AdvisorService = Depends(get_advisor_service),
) -> AdvisorRecommendResponse:
    if not service.is_loaded:
        raise HTTPException(status_code=503, detail=f"Advisor model not available: {service.status['message']}")

    try:
        payload = await service.recommend(
            request_data=request.model_dump(),
            generate_llm=request.generate_llm,
        )
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (NotImplementedError, LLMProviderError) as exc:
        raise HTTPException(status_code=503, detail=f"LLM provider unavailable: {exc}") from exc

    return AdvisorRecommendResponse.model_validate(payload)


@router.get("/languages", response_model=AdvisorLanguagesResponse)
async def list_languages(
    service: AdvisorService = Depends(get_advisor_service),
) -> AdvisorLanguagesResponse:
    payload = await service.list_languages()
    return AdvisorLanguagesResponse.model_validate(payload)
