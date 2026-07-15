"""Yield prediction service — Phase 3 implementation."""

import logging
from importlib import import_module
from pathlib import Path
from time import perf_counter

from app.core.config import Settings, get_settings
from app.repositories.prediction_repository import PredictionRepository
from app.services.history_helper import persist_prediction

# "yield" is a Python keyword, so app.ml.yield can't be reached with a normal import statement.
_yield_ml = import_module("app.ml.yield")
YieldArtifacts = _yield_ml.YieldArtifacts
load_yield_artifacts = _yield_ml.load_yield_artifacts
predict_yield = _yield_ml.predict_yield

logger = logging.getLogger(__name__)


def _to_notebook_fields(request_data: dict) -> dict:
    """Map API request field names onto the notebook's PascalCase feature names."""
    return {
        "Crop": request_data["crop"],
        "State": request_data["state"],
        "Season": request_data["season"],
        "Annual_Rainfall": request_data["annual_rainfall"],
        "Area": request_data["area"],
        "Fertilizer": request_data["fertilizer"],
        "Pesticide": request_data["pesticide"],
        "Crop_Year": request_data["year"],
    }


class YieldService:
    """Orchestrates crop yield prediction inference."""

    def __init__(
        self,
        settings: Settings | None = None,
        prediction_repository: PredictionRepository | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._prediction_repository = prediction_repository or PredictionRepository()
        self._loaded = False
        self._status: dict = {"loaded": False, "message": "Service not initialized", "missing_files": []}
        self._metadata: dict = {"default_model": "xgb_full", "models": []}
        self._artifacts: YieldArtifacts | None = None

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
        """Load yield artifacts and models into memory at startup."""
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

        try:
            artifacts = load_yield_artifacts(self.artifact_dir)
        except Exception as exc:  # noqa: BLE001 - surfaced via status, not raised
            self._loaded = False
            self._status = {"loaded": False, "message": f"Failed to load yield artifacts: {exc}", "missing_files": []}
            logger.exception("YieldService failed to load artifacts from %s", self.artifact_dir)
            return

        self._metadata = {
            "default_model": artifacts.default_model_key,
            "models": [
                {"key": "xgb_full", "algorithm": "XGBoost", "feature_set": "full", "r2": None, "rmse": None, "mae": None},
                {"key": "xgb_min", "algorithm": "XGBoost", "feature_set": "min", "r2": None, "rmse": None, "mae": None},
                {"key": "rf_full", "algorithm": "RandomForest", "feature_set": "full", "r2": None, "rmse": None, "mae": None},
                {"key": "rf_min", "algorithm": "RandomForest", "feature_set": "min", "r2": None, "rmse": None, "mae": None},
                {"key": "gb_full", "algorithm": "HistGradientBoosting", "feature_set": "full", "r2": None, "rmse": None, "mae": None},
                {"key": "gb_min", "algorithm": "HistGradientBoosting", "feature_set": "min", "r2": None, "rmse": None, "mae": None},
            ],
        }
        self._artifacts = artifacts
        self._loaded = True
        self._status = {
            "loaded": True,
            "message": "Yield artifacts and models loaded",
            "missing_files": [],
        }
        logger.info("YieldService models loaded from %s", self.artifact_dir)

    async def predict(self, request_data: dict, model_key: str | None = None) -> dict:
        """Run yield inference for the requested (or default) model variant."""
        if not self._loaded or self._artifacts is None:
            raise RuntimeError("Yield service artifacts are not loaded")

        selected_model_key = model_key or request_data.get("model") or self._artifacts.default_model_key
        notebook_fields = _to_notebook_fields(request_data)

        started_at = perf_counter()
        result = predict_yield(notebook_fields, self._artifacts, selected_model_key)
        inference_time_ms = int((perf_counter() - started_at) * 1000)

        payload = {
            "predicted_yield": result["predicted_yield"],
            "unit": "tonnes/ha",
            "model_used": result["model_key"],
            "feature_set": result["feature_set"],
            "inference_time_ms": inference_time_ms,
            "feature_importance": None,
        }

        await persist_prediction(
            self._prediction_repository,
            module="yield",
            model_name=payload["model_used"],
            request_json=request_data,
            response_json=payload,
            latency_ms=inference_time_ms,
        )

        return payload

    async def list_models(self) -> dict:
        """Return available model metadata from artifacts."""
        return {
            "default_model": self._metadata.get("default_model", "xgb_full"),
            "models": self._metadata.get("models", []),
        }
