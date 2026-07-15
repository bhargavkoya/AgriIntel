"""Disease detection service — Phase 3 implementation."""

import json
import logging
from io import BytesIO
from pathlib import Path
from time import perf_counter

from PIL import Image

from app.core.config import Settings, get_settings
from app.ml.disease import DiseaseArtifacts, load_disease_artifacts, predict_leaf
from app.repositories.file_repository import FileRepository
from app.repositories.prediction_repository import PredictionRepository
from app.services.history_helper import persist_prediction

logger = logging.getLogger(__name__)

ACTIVE_MODEL_MAP = {
    "custom cnn": "custom",
    "efficientnetb0": "efficientnet",
    "resnet50": "resnet",
    "vgg16": "vgg16",
    "custom": "custom",
    "efficientnet": "efficientnet",
    "resnet": "resnet",
    "vgg": "vgg16",
}

FILE_TO_SHORT_NAME = {
    "custom.keras": "custom",
    "efficientnet.keras": "efficientnet",
    "resnet.keras": "resnet",
    "vgg16.keras": "vgg16",
}

SHORT_TO_DISPLAY_NAME = {
    "custom": "Custom CNN",
    "efficientnet": "EfficientNetB0",
    "resnet": "ResNet50",
    "vgg16": "VGG16",
}


class DiseaseService:
    """Orchestrates crop disease detection inference."""

    def __init__(
        self,
        settings: Settings | None = None,
        prediction_repository: PredictionRepository | None = None,
        file_repository: FileRepository | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._prediction_repository = prediction_repository or PredictionRepository()
        self._file_repository = file_repository or FileRepository()
        self._loaded = False
        self._status: dict = {"loaded": False, "message": "Service not initialized", "missing_files": []}
        self._metadata: dict = {"active_model": "efficientnet", "models": []}
        self._artifacts: DiseaseArtifacts | None = None

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def status(self) -> dict:
        return self._status

    @property
    def artifact_dir(self) -> Path:
        return self._settings.disease_artifacts_path

    async def load(self) -> None:
        """Load disease artifacts and models into memory at startup."""
        required_files = ["class_names.json", "image_config.json", "metrics.json"]
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
            artifacts = load_disease_artifacts(self.artifact_dir)
        except Exception as exc:  # noqa: BLE001 - surfaced via status, not raised
            self._loaded = False
            self._status = {"loaded": False, "message": f"Failed to load disease artifacts: {exc}", "missing_files": []}
            logger.exception("DiseaseService failed to load artifacts from %s", self.artifact_dir)
            return

        image_config = json.loads((self.artifact_dir / "image_config.json").read_text(encoding="utf-8"))
        metrics = json.loads((self.artifact_dir / "metrics.json").read_text(encoding="utf-8"))
        active_model = str(metrics.get("active_model") or "EfficientNetB0")

        model_rows = [
            {
                "name": FILE_TO_SHORT_NAME.get(file_name, file_name.replace(".keras", "")),
                "file": file_name,
                "input_size": [int(config["height"]), int(config["width"])],
                "preprocess_mode": str(config["preprocess_mode"]),
                "test_accuracy": None,
            }
            for file_name, config in image_config.items()
        ]

        normalized_active = ACTIVE_MODEL_MAP.get(active_model.strip().lower(), "efficientnet")
        if active_model.endswith(".keras"):
            normalized_active = FILE_TO_SHORT_NAME.get(active_model, normalized_active)

        self._artifacts = artifacts
        self._metadata = {"active_model": normalized_active, "models": model_rows}
        self._loaded = True
        self._status = {
            "loaded": True,
            "message": "Disease artifacts and models loaded",
            "missing_files": [],
        }
        logger.info("DiseaseService models loaded from %s", self.artifact_dir)

    async def predict(self, image_bytes: bytes, model_name: str | None = None, filename: str | None = None) -> dict:
        """Run leaf disease inference against the requested (or active) model."""
        if not self._loaded or self._artifacts is None:
            raise RuntimeError("Disease service artifacts are not loaded")

        display_name = None
        if model_name:
            display_name = SHORT_TO_DISPLAY_NAME.get(model_name)
            if display_name is None:
                raise KeyError(f"Unknown disease model: {model_name}")

        image = Image.open(BytesIO(image_bytes))
        started_at = perf_counter()
        result = predict_leaf(image, self._artifacts, display_name)
        inference_time_ms = int((perf_counter() - started_at) * 1000)

        payload = {
            "prediction": {
                "class_name": result["label"],
                "class_index": self._artifacts.class_names.index(result["label"]),
                "confidence": result["confidence"],
                "verdict": result["status"],
                "low_confidence_warning": result["low_confidence"],
            },
            "model_used": FILE_TO_SHORT_NAME.get(result["model_file"], result["model_name"]),
            "top_predictions": [
                {"class_name": item["label"], "confidence": item["confidence"]}
                for item in result["top_predictions"]
            ],
            "inference_time_ms": inference_time_ms,
        }

        try:
            await self._file_repository.save(filename=filename or "upload", content=image_bytes, module="disease")
        except Exception:  # noqa: BLE001 - best-effort side effect, never fails the request
            logger.exception("Failed to persist uploaded disease image")

        await persist_prediction(
            self._prediction_repository,
            module="disease",
            model_name=payload["model_used"],
            request_json={"filename": filename, "model": model_name},
            response_json=payload,
            latency_ms=inference_time_ms,
        )

        return payload

    async def list_models(self) -> dict:
        """Return available model metadata from artifacts."""
        return {
            "active_model": self._metadata.get("active_model", "efficientnet"),
            "models": self._metadata.get("models", []),
        }
