"""Yield prediction service — Phase 3 implementation."""

import json
import logging
from pathlib import Path

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


class YieldService:
    """Orchestrates crop yield prediction inference."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._loaded = False
        self._status: dict = {"loaded": False, "message": "Service not initialized", "missing_files": []}
        self._metadata: dict = {"default_model": "xgb_full", "models": []}

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def status(self) -> dict:
        return self._status

    @property
    def artifact_dir(self) -> Path:
        return self._settings.yield_artifacts_path

    async def load(self) -> None:
        """Load yield artifact metadata at startup (model execution in sub-phase 3.2)."""
        required_files = ["feature_config.json", "best_model.json", "preprocessor_full.pkl"]
        if not self.artifact_dir.exists():
            self._loaded = False
            self._status = {
                "loaded": False,
                "message": f"Directory not found: {self.artifact_dir}",
                "missing_files": required_files,
            }
            return

        missing_files = [name for name in required_files if not (self.artifact_dir / name).exists()]
        if missing_files:
            self._loaded = False
            self._status = {
                "loaded": False,
                "message": f"Missing {len(missing_files)} required file(s)",
                "missing_files": missing_files,
            }
            return

        best_model_data = json.loads((self.artifact_dir / "best_model.json").read_text(encoding="utf-8"))
        best_name = str(best_model_data.get("best_full_model") or "XGBoost (full)").lower()
        if "xgboost" in best_name:
            default_model = "xgb_full"
        elif "random" in best_name:
            default_model = "rf_full"
        elif "gradient" in best_name or "hist" in best_name:
            default_model = "gb_full"
        else:
            default_model = "xgb_full"

        self._metadata = {
            "default_model": default_model,
            "models": [
                {"key": "xgb_full", "algorithm": "XGBoost", "feature_set": "full", "r2": None, "rmse": None, "mae": None},
                {"key": "xgb_min", "algorithm": "XGBoost", "feature_set": "min", "r2": None, "rmse": None, "mae": None},
                {"key": "rf_full", "algorithm": "RandomForest", "feature_set": "full", "r2": None, "rmse": None, "mae": None},
                {"key": "rf_min", "algorithm": "RandomForest", "feature_set": "min", "r2": None, "rmse": None, "mae": None},
                {"key": "gb_full", "algorithm": "HistGradientBoosting", "feature_set": "full", "r2": None, "rmse": None, "mae": None},
                {"key": "gb_min", "algorithm": "HistGradientBoosting", "feature_set": "min", "r2": None, "rmse": None, "mae": None},
            ],
        }
        self._loaded = True
        self._status = {
            "loaded": True,
            "message": "Yield artifacts verified; inference execution will be enabled in sub-phase 3.2",
            "missing_files": [],
        }
        logger.info("YieldService metadata loaded from %s", self.artifact_dir)

    async def predict(self, request_data: dict, model_key: str | None = None) -> dict:
        """Return schema-compatible placeholder response for Phase 3.1 wiring."""
        selected_model = model_key or request_data.get("model") or self._metadata.get("default_model", "xgb_full")
        feature_set = "full" if str(selected_model).endswith("_full") else "min"
        return {
            "predicted_yield": 0.0,
            "unit": "tonnes/ha",
            "model_used": selected_model,
            "feature_set": feature_set,
            "inference_time_ms": 0,
            "feature_importance": None,
        }

    async def list_models(self) -> dict:
        """Return available model metadata from artifacts."""
        return {
            "default_model": self._metadata.get("default_model", "xgb_full"),
            "models": self._metadata.get("models", []),
        }
