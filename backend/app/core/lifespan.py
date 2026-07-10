"""Application lifespan — startup and shutdown hooks."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


def _check_artifact_dir(path_name: str, required_files: list[str]) -> dict:
    """Check if artifact directory exists and list missing required files."""
    settings = get_settings()
    path = getattr(settings, f"{path_name}_artifacts_path")

    if not path.exists():
        return {
            "loaded": False,
            "message": f"Directory not found: {path}",
            "missing_files": required_files,
        }

    missing = [f for f in required_files if not (path / f).exists()]
    if missing:
        return {
            "loaded": False,
            "message": f"Missing {len(missing)} required file(s)",
            "missing_files": missing,
        }

    return {"loaded": False, "message": "Phase 1 stub — models not loaded yet"}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup: verify artifact directories. Shutdown: cleanup."""
    settings: Settings = get_settings()
    logger.info("Starting AgriIntel backend (env=%s)", settings.app_env)

    app.state.module_status = {
        "disease": _check_artifact_dir(
            "disease",
            ["class_names.json", "image_config.json", "metrics.json"],
        ),
        "yield": _check_artifact_dir(
            "yield",
            ["feature_config.json", "best_model.json", "preprocessor_full.pkl"],
        ),
        "advisor": _check_artifact_dir(
            "advisor",
            ["rules.json", "rf_model.pkl", "label_encoders.pkl", "feature_config.json"],
        ),
    }

    for module, status in app.state.module_status.items():
        logger.info("Module %s: %s", module, status.get("message", "unknown"))

    logger.info("AgriIntel backend ready")
    yield
    logger.info("AgriIntel backend shutting down")
