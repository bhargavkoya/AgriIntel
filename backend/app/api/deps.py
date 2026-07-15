"""Dependency injection providers."""

from fastapi import Request

from app.core.config import Settings, get_settings
from app.repositories.prediction_repository import PredictionRepository
from app.services.advisor_service import AdvisorService
from app.services.disease_service import DiseaseService
from app.services.yield_service import YieldService


def get_app_settings() -> Settings:
    return get_settings()


def get_prediction_repository() -> PredictionRepository:
    return PredictionRepository()


def get_disease_service(request: Request) -> DiseaseService:
    service = getattr(request.app.state, "disease_service", None)
    if service is None:
        raise RuntimeError("Disease service is not initialized")
    return service


def get_yield_service(request: Request) -> YieldService:
    service = getattr(request.app.state, "yield_service", None)
    if service is None:
        raise RuntimeError("Yield service is not initialized")
    return service


def get_advisor_service(request: Request) -> AdvisorService:
    service = getattr(request.app.state, "advisor_service", None)
    if service is None:
        raise RuntimeError("Advisor service is not initialized")
    return service
