"""Application lifespan — startup and shutdown hooks."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app import models  # noqa: F401 - registers ORM models on Base.metadata
from app.core.config import Settings, get_settings
from app.database.base import Base
from app.database.engine import create_db_engine
from app.services.advisor_service import AdvisorService
from app.services.disease_service import DiseaseService
from app.services.yield_service import YieldService

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup: initialize services and load artifact metadata. Shutdown: cleanup."""
    settings: Settings = get_settings()
    logger.info("Starting AgriIntel backend (env=%s)", settings.app_env)

    Base.metadata.create_all(bind=create_db_engine())

    app.state.disease_service = DiseaseService(settings=settings)
    app.state.yield_service = YieldService(settings=settings)
    app.state.advisor_service = AdvisorService(settings=settings)

    await app.state.disease_service.load()
    await app.state.yield_service.load()
    await app.state.advisor_service.load()

    app.state.module_status = {
        "disease": app.state.disease_service.status,
        "yield": app.state.yield_service.status,
        "advisor": app.state.advisor_service.status,
    }

    for module, status in app.state.module_status.items():
        logger.info("Module %s: %s", module, status.get("message", "unknown"))

    logger.info("AgriIntel backend ready")
    yield
    logger.info("AgriIntel backend shutting down")
