"""ML inference wrappers — thin layer over training/inference/ modules."""

import sys
from pathlib import Path

# training/ lives outside the backend/ package root, so it must be added to
# sys.path before any app.ml.* submodule can import training.inference.*.
_REPO_ROOT = Path(__file__).resolve().parents[3]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))
