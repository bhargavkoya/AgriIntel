"""Crop yield prediction inference extracted from the Module B notebook."""

from __future__ import annotations

from dataclasses import dataclass
from math import expm1
from pathlib import Path
from typing import Any, Mapping

from ..common import load_joblib, read_json, resolve_artifact_dir

MODEL_FILE_MAP = {
    "xgb_full": ("models/xgb_full.pkl", "full"),
    "xgb_min": ("models/xgb_min.pkl", "min"),
    "rf_full": ("models/rf_full.pkl", "full"),
    "rf_min": ("models/rf_min.pkl", "min"),
    "gb_full": ("models/gb_full.pkl", "full"),
    "gb_min": ("models/gb_min.pkl", "min"),
}


@dataclass(slots=True)
class YieldArtifacts:
    artifact_dir: Path
    feature_config: dict[str, Any]
    best_model_key: str
    preprocessor_full: Any | None
    preprocessor_min: Any | None
    models: dict[str, Any]

    @property
    def default_model_key(self) -> str:
        return self.best_model_key


def _resolve_best_model_key(best_model_name: str) -> str:
    normalized = " ".join(best_model_name.replace("(", " ").replace(")", " ").split()).lower()
    if "xgboost" in normalized and "full" in normalized:
        return "xgb_full"
    if "xgboost" in normalized and "min" in normalized:
        return "xgb_min"
    if "random" in normalized and "full" in normalized:
        return "rf_full"
    if "random" in normalized and "min" in normalized:
        return "rf_min"
    if ("hist" in normalized or "gradient" in normalized or "gb" in normalized) and "full" in normalized:
        return "gb_full"
    if ("hist" in normalized or "gradient" in normalized or "gb" in normalized) and "min" in normalized:
        return "gb_min"
    return "xgb_full"


def load_yield_artifacts(artifact_dir: str | Path, load_models: bool = True) -> YieldArtifacts:
    root = resolve_artifact_dir(artifact_dir)
    feature_config = read_json(root / "feature_config.json")
    best_model_info = read_json(root / "best_model.json")
    best_model_key = _resolve_best_model_key(str(best_model_info.get("best_full_model", "")))

    preprocessor_full = load_joblib(root / "preprocessor_full.pkl") if load_models and (root / "preprocessor_full.pkl").exists() else None
    preprocessor_min = load_joblib(root / "preprocessor_min.pkl") if load_models and (root / "preprocessor_min.pkl").exists() else None

    models: dict[str, Any] = {}
    if load_models:
        for model_key, (relative_path, _) in MODEL_FILE_MAP.items():
            model_path = root / relative_path
            if model_path.exists():
                models[model_key] = load_joblib(model_path)

    return YieldArtifacts(
        artifact_dir=root,
        feature_config=feature_config,
        best_model_key=best_model_key,
        preprocessor_full=preprocessor_full,
        preprocessor_min=preprocessor_min,
        models=models,
    )


def derive_yield_features(request_data: Mapping[str, Any]) -> dict[str, Any]:
    area = float(request_data["Area"])
    if area <= 0:
        raise ValueError("Area must be greater than zero")

    fertilizer = float(request_data["Fertilizer"])
    pesticide = float(request_data["Pesticide"])

    derived = dict(request_data)
    derived["Fertilizer_per_ha"] = fertilizer / area
    derived["Pesticide_per_ha"] = pesticide / area
    return derived


def _get_feature_columns(feature_config: Mapping[str, Any], feature_set: str) -> list[str]:
    numeric_key = f"numeric_features_{feature_set}"
    return list(feature_config[numeric_key]) + list(feature_config["categorical_features"])


def _select_preprocessor(artifacts: YieldArtifacts, feature_set: str):
    if feature_set == "full":
        return artifacts.preprocessor_full
    if feature_set == "min":
        return artifacts.preprocessor_min
    raise ValueError(f"Unknown feature set: {feature_set}")


def predict_yield(
    request_data: Mapping[str, Any],
    artifacts: YieldArtifacts,
    model_key: str | None = None,
) -> dict[str, Any]:
    selected_model_key = model_key or artifacts.default_model_key
    if selected_model_key not in artifacts.models:
        raise KeyError(f"Yield model has not been loaded: {selected_model_key}")

    _, feature_set = MODEL_FILE_MAP[selected_model_key]
    preprocessor = _select_preprocessor(artifacts, feature_set)
    if preprocessor is None:
        raise KeyError(f"Yield preprocessor has not been loaded for feature set: {feature_set}")

    derived = derive_yield_features(request_data)
    feature_columns = _get_feature_columns(artifacts.feature_config, feature_set)

    try:
        import pandas as pd
    except ImportError as exc:  # pragma: no cover - optional runtime dependency
        raise ImportError("pandas is required to prepare yield inference inputs") from exc

    frame = pd.DataFrame([{column: derived[column] for column in feature_columns}])
    transformed = preprocessor.transform(frame)
    log_prediction = float(artifacts.models[selected_model_key].predict(transformed)[0])
    predicted_yield = max(0.0, expm1(log_prediction))

    return {
        "model_key": selected_model_key,
        "feature_set": feature_set,
        "log_prediction": log_prediction,
        "predicted_yield": predicted_yield,
        "derived_features": {
            "Fertilizer_per_ha": derived["Fertilizer_per_ha"],
            "Pesticide_per_ha": derived["Pesticide_per_ha"],
        },
    }
