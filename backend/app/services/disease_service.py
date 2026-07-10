"""Disease detection service — Phase 3 implementation."""

import json
import logging
from pathlib import Path

from app.core.config import Settings, get_settings

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


class DiseaseService:
    """Orchestrates crop disease detection inference."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._loaded = False
        self._status: dict = {"loaded": False, "message": "Service not initialized", "missing_files": []}
        self._metadata: dict = {"active_model": "efficientnet", "models": []}

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
        """Load disease artifact metadata at startup (model loading in sub-phase 3.2)."""
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

        image_config = json.loads((self.artifact_dir / "image_config.json").read_text(encoding="utf-8"))
        metrics = json.loads((self.artifact_dir / "metrics.json").read_text(encoding="utf-8"))
        active_model = str(metrics.get("active_model") or "EfficientNetB0")

        reverse_name_map = {
            "custom.keras": "custom",
            "efficientnet.keras": "efficientnet",
            "resnet.keras": "resnet",
            "vgg16.keras": "vgg16",
        }

        model_rows = []
        for file_name, config in image_config.items():
            model_rows.append(
                {
                    "name": reverse_name_map.get(file_name, file_name.replace(".keras", "")),
                    "file": file_name,
                    "input_size": [int(config["height"]), int(config["width"])],
                    "preprocess_mode": str(config["preprocess_mode"]),
                    "test_accuracy": None,
                }
            )

        normalized_active = ACTIVE_MODEL_MAP.get(active_model.strip().lower(), "efficientnet")
        if active_model.endswith(".keras"):
            normalized_active = reverse_name_map.get(active_model, normalized_active)

        self._metadata = {"active_model": normalized_active, "models": model_rows}
        self._loaded = True
        self._status = {
            "loaded": True,
            "message": "Disease artifacts verified; inference execution will be enabled in sub-phase 3.2",
            "missing_files": [],
        }
        logger.info("DiseaseService metadata loaded from %s", self.artifact_dir)

    async def predict(self, image_bytes: bytes, model_name: str | None = None) -> dict:
        """Return schema-compatible placeholder response for Phase 3.1 wiring."""
        model_used = model_name or self._metadata.get("active_model", "efficientnet")
        return {
            "prediction": {
                "class_name": "NotImplemented",
                "class_index": -1,
                "confidence": 0.0,
                "verdict": "PENDING",
                "low_confidence_warning": True,
            },
            "model_used": model_used,
            "top_predictions": [],
            "inference_time_ms": 0,
        }

    async def list_models(self) -> dict:
        """Return available model metadata from artifacts."""
        return {
            "active_model": self._metadata.get("active_model", "efficientnet"),
            "models": self._metadata.get("models", []),
        }
