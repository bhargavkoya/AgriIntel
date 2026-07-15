"""Reusable inference helpers extracted from the training notebooks.

Phase 2 keeps notebook logic in the research artifacts while exposing the
pure inference surface here for later backend integration.
"""

from importlib import import_module

from .advisor.inference import (
    AdvisorArtifacts,
    LLMProvider,
    build_advisory_context,
    build_prompt,
    classify_nutrient,
    derive_overall_label,
    generate_english_advisory,
    load_advisor_artifacts,
    predict_soil_health,
    run_full_pipeline,
    translate_text,
)
from .disease.inference import (
    DiseaseArtifacts,
    DiseaseImageConfig,
    load_disease_artifacts,
    predict_leaf,
    preprocess_image,
)

_yield_inference = import_module(".yield.inference", __name__)
YieldArtifacts = _yield_inference.YieldArtifacts
derive_yield_features = _yield_inference.derive_yield_features
load_yield_artifacts = _yield_inference.load_yield_artifacts
predict_yield = _yield_inference.predict_yield

__all__ = [
    "AdvisorArtifacts",
    "DiseaseArtifacts",
    "DiseaseImageConfig",
    "LLMProvider",
    "YieldArtifacts",
    "build_advisory_context",
    "build_prompt",
    "classify_nutrient",
    "derive_overall_label",
    "derive_yield_features",
    "generate_english_advisory",
    "load_advisor_artifacts",
    "load_disease_artifacts",
    "load_yield_artifacts",
    "predict_leaf",
    "predict_soil_health",
    "predict_yield",
    "preprocess_image",
    "run_full_pipeline",
    "translate_text",
]

