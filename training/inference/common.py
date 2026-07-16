"""Shared helpers for notebook-derived inference modules."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def resolve_artifact_dir(artifact_dir: str | Path) -> Path:
    path = Path(artifact_dir).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(f"Artifact directory not found: {path}")
    if not path.is_dir():
        raise NotADirectoryError(f"Artifact path is not a directory: {path}")
    return path


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def load_joblib(path: Path) -> Any:
    try:
        import joblib
    except ImportError as exc:  # pragma: no cover - optional runtime dependency
        raise ImportError(
            "joblib is required to load notebook-exported artifacts"
        ) from exc

    return joblib.load(path)


def load_xgboost_model(path: Path) -> Any:
    """Load an XGBRegressor saved via its native save_model() format.

    Raw pickle/joblib dumps of a Booster are not guaranteed portable across
    xgboost versions (unlike plain scikit-learn estimators); the native
    JSON/UBJSON format from save_model()/load_model() is.
    """
    try:
        from xgboost import XGBRegressor
    except ImportError as exc:  # pragma: no cover - optional runtime dependency
        raise ImportError(
            "xgboost is required to load notebook-exported XGBoost models"
        ) from exc

    model = XGBRegressor()
    model.load_model(str(path))
    return model


def load_keras_model(path: Path) -> Any:
    try:
        from tensorflow.keras.models import load_model
    except ImportError as exc:  # pragma: no cover - optional runtime dependency
        raise ImportError(
            "tensorflow is required to load notebook-exported Keras models"
        ) from exc

    try:
        return load_model(path, compile=False)
    except Exception as native_error:
        # Some exported models use the legacy tf_keras (Keras 2) format that
        # Keras 3's native loader can't deserialize; fall back to it.
        try:
            from tf_keras.models import load_model as load_legacy_model
        except ImportError:
            raise native_error

        return load_legacy_model(path, compile=False)


def pretty_label(name: str) -> str:
    return name.replace("_", " ").strip().title()


def safe_float(value: Any) -> float:
    return float(value) if value is not None else 0.0
