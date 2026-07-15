"""Soil health advisor service — Phase 3 implementation."""

import logging
from pathlib import Path
from time import perf_counter

from app.core.config import Settings, get_settings
from app.integrations.llm.base import LLMProvider
from app.integrations.llm.groq_provider import create_groq_provider
from app.ml.advisor import AdvisorArtifacts, load_advisor_artifacts, run_full_pipeline
from app.repositories.prediction_repository import PredictionRepository
from app.services.history_helper import persist_prediction

logger = logging.getLogger(__name__)

ADVISOR_MODEL_NAME = "rf_classifier"


class AdvisorService:
    """Orchestrates the 3-layer soil health advisory pipeline."""

    def __init__(
        self,
        settings: Settings | None = None,
        llm_provider: LLMProvider | None = None,
        prediction_repository: PredictionRepository | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._llm_provider = llm_provider or create_groq_provider(
            api_key=self._settings.groq_api_key,
            model=self._settings.groq_model,
            temperature=self._settings.groq_temperature,
            max_tokens=self._settings.groq_max_tokens,
        )
        self._prediction_repository = prediction_repository or PredictionRepository()
        self._loaded = False
        self._status: dict = {"loaded": False, "message": "Service not initialized", "missing_files": []}
        self._language_codes: dict[str, str] = {"English": "en", "Hindi": "hi", "Telugu": "te"}
        self._artifacts: AdvisorArtifacts | None = None

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
        """Load advisor artifacts and the RF model into memory at startup."""
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

        try:
            artifacts = load_advisor_artifacts(self.artifact_dir)
        except Exception as exc:  # noqa: BLE001 - surfaced via status, not raised
            self._loaded = False
            self._status = {"loaded": False, "message": f"Failed to load advisor artifacts: {exc}", "missing_files": []}
            logger.exception("AdvisorService failed to load artifacts from %s", self.artifact_dir)
            return

        self._artifacts = artifacts
        self._language_codes = dict(artifacts.language_codes)
        self._loaded = True
        self._status = {
            "loaded": True,
            "message": "Advisor artifacts and model loaded",
            "missing_files": [],
        }
        logger.info("AdvisorService model loaded from %s", self.artifact_dir)

    async def recommend(self, request_data: dict, generate_llm: bool = True) -> dict:
        """Run the 3-layer soil health advisory pipeline for a single request."""
        if not self._loaded or self._artifacts is None:
            raise RuntimeError("Advisor service artifacts are not loaded")

        started_at = perf_counter()
        results = run_full_pipeline(
            [request_data],
            self._artifacts,
            generate_llm=generate_llm,
            llm_provider=self._llm_provider if generate_llm else None,
            llm_languages=list(self._artifacts.language_codes) if generate_llm else None,
        )
        inference_time_ms = int((perf_counter() - started_at) * 1000)
        result = results[0]

        nutrient_statuses = {
            item["column"]: {
                "value": float(item["value"]) if item["value"] is not None else 0.0,
                "status": item["status"],
                "recommendation": item["recommendation"] or None,
            }
            for item in result["context"]["nutrients"]
        }

        class_probabilities = {
            label: round(float(probability) / 100, 4) for label, probability in result["l2_confidence"].items()
        }

        layer3 = None
        if generate_llm and result["advisories"]:
            layer3 = {"advisories": result["advisories"]}

        payload = {
            "layer1": {
                "nutrient_statuses": nutrient_statuses,
                "overall_label": result["overall_label"],
                "problem_count": result["problem_count"],
            },
            "layer2": {
                "prediction": result["l2_prediction"],
                "confidence": class_probabilities.get(result["l2_prediction"], 0.0),
                "class_probabilities": class_probabilities,
            },
            "layer3": layer3,
            "inference_time_ms": inference_time_ms,
        }

        await persist_prediction(
            self._prediction_repository,
            module="advisor",
            model_name=ADVISOR_MODEL_NAME,
            request_json=request_data,
            response_json=payload,
            latency_ms=inference_time_ms,
        )

        return payload

    async def list_languages(self) -> dict:
        """Return supported advisory languages."""
        return {
            "languages": [{"name": name, "code": code} for name, code in self._language_codes.items()],
        }
