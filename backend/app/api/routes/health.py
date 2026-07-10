"""Health check endpoint."""

from fastapi import APIRouter, Request

from app.api.deps import get_app_settings
from app.core.config import Settings

router = APIRouter()


@router.get("/health")
async def health_check(request: Request) -> dict:
    """Return application and module artifact status."""
    settings: Settings = get_app_settings()
    module_status = getattr(request.app.state, "module_status", {})

    return {
        "status": "healthy",
        "version": "0.1.0",
        "environment": settings.app_env,
        "modules": module_status,
    }
