"""Soil health advisor service — Phase 3 implementation."""

import json
import logging
from pathlib import Path

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


class AdvisorService:
    """Orchestrates the 3-layer soil health advisory pipeline."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._loaded = False
        self._status: dict = {"loaded": False, "message": "Service not initialized", "missing_files": []}
        self._language_codes: dict[str, str] = {"English": "en", "Hindi": "hi", "Telugu": "te"}

    @property
    def artifact_dir(self) -> Path:
        return self._settings.advisor_artifacts_path

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def status(self) -> dict:
        return self._status

    async def load(self) -> None:
        """Load advisor artifact metadata at startup (full pipeline in sub-phase 3.2)."""
        required_files = [
            "rules.json",
            "rf_model.pkl",
            "label_encoders.pkl",
            "feature_config.json",
            "prompt_template.txt",
            "language_codes.json",
        ]
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

        self._language_codes = json.loads((self.artifact_dir / "language_codes.json").read_text(encoding="utf-8"))
        self._loaded = True
        self._status = {
            "loaded": True,
            "message": "Advisor artifacts verified; pipeline execution will be enabled in sub-phase 3.2",
            "missing_files": [],
        }
        logger.info("AdvisorService metadata loaded from %s", self.artifact_dir)

    async def recommend(self, request_data: dict, generate_llm: bool = True) -> dict:
        """Return schema-compatible placeholder response for Phase 3.1 wiring."""
        nutrient_fields = [
            "ph",
            "organic_carbon",
            "nitrogen",
            "phosphorus",
            "potassium",
            "sulphur",
            "zinc",
            "boron",
            "iron",
            "manganese",
            "copper",
        ]
        nutrient_statuses = {
            field: {
                "value": float(request_data.get(field, 0.0)),
                "status": "Pending",
                "recommendation": "Will be computed in sub-phase 3.2",
            }
            for field in nutrient_fields
        }

        layer3 = None
        if generate_llm:
            layer3 = {
                "advisories": {
                    "English": "LLM advisory generation will be enabled in sub-phase 3.2",
                }
            }

        return {
            "layer1": {
                "nutrient_statuses": nutrient_statuses,
                "overall_label": "Pending",
                "problem_count": 0,
            },
            "layer2": {
                "prediction": "Pending",
                "confidence": 0.0,
                "class_probabilities": {"Poor": 0.0, "Moderate": 0.0, "Good": 0.0},
            },
            "layer3": layer3,
            "inference_time_ms": 0,
        }

    async def list_languages(self) -> dict:
        """Return supported advisory languages."""
        return {
            "languages": [{"name": name, "code": code} for name, code in self._language_codes.items()],
        }
