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


def load_keras_model(path: Path) -> Any:
    try:
        from tensorflow.keras.models import load_model
    except ImportError as exc:  # pragma: no cover - optional runtime dependency
        raise ImportError(
            "tensorflow is required to load notebook-exported Keras models"
        ) from exc

    return load_model(path, compile=False)


def pretty_label(name: str) -> str:
    return name.replace("_", " ").strip().title()


def safe_float(value: Any) -> float:
    return float(value) if value is not None else 0.0
