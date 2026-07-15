"""Yield prediction ML wrappers — Phase 3 implementation."""

from importlib import import_module

# "yield" is a Python keyword, so the sibling package can't be reached with a
# normal `from training.inference.yield import ...` statement.
_inference = import_module("training.inference.yield.inference")

MODEL_FILE_MAP = _inference.MODEL_FILE_MAP
YieldArtifacts = _inference.YieldArtifacts
derive_yield_features = _inference.derive_yield_features
load_yield_artifacts = _inference.load_yield_artifacts
predict_yield = _inference.predict_yield

__all__ = [
    "MODEL_FILE_MAP",
    "YieldArtifacts",
    "derive_yield_features",
    "load_yield_artifacts",
    "predict_yield",
]
