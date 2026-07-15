"""SQLAlchemy ORM models."""

from app.models.prediction_history import PredictionHistory
from app.models.uploaded_file import UploadedFile

__all__ = ["PredictionHistory", "UploadedFile"]
