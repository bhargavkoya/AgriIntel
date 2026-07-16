"""Prediction history repository — Phase 3 implementation."""

import logging

from sqlalchemy.orm import Session, sessionmaker

from app.database.session import get_session_factory
from app.models.prediction_history import PredictionHistory

logger = logging.getLogger(__name__)


class PredictionRepository:
    """CRUD operations for prediction history records."""

    def __init__(self, session_factory: sessionmaker[Session] | None = None) -> None:
        self._session_factory = session_factory or get_session_factory()

    async def create(
        self,
        module: str,
        model_name: str,
        request_json: dict,
        response_json: dict,
        latency_ms: int,
    ) -> int:
        """Persist a prediction record and return its id."""
        with self._session_factory() as session:
            record = PredictionHistory(
                module=module,
                model_name=model_name,
                request_json=request_json,
                response_json=response_json,
                latency_ms=latency_ms,
            )
            session.add(record)
            session.commit()
            session.refresh(record)
            return record.id

    async def get_by_id(self, record_id: int) -> dict | None:
        """Retrieve a single prediction record by id, or None if not found."""
        with self._session_factory() as session:
            record = session.get(PredictionHistory, record_id)
            if record is None:
                return None

            return {
                "id": record.id,
                "module": record.module,
                "model_name": record.model_name,
                "timestamp": record.timestamp.isoformat(),
                "request_json": record.request_json,
                "response_json": record.response_json,
                "latency_ms": record.latency_ms,
            }

    async def list(
        self,
        module: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        """Retrieve paginated prediction history, newest first."""
        with self._session_factory() as session:
            query = session.query(PredictionHistory)
            if module:
                query = query.filter(PredictionHistory.module == module)

            total = query.count()
            records = (
                query.order_by(PredictionHistory.timestamp.desc())
                .offset((page - 1) * page_size)
                .limit(page_size)
                .all()
            )

            return {
                "items": [
                    {
                        "id": record.id,
                        "module": record.module,
                        "model_name": record.model_name,
                        "timestamp": record.timestamp.isoformat(),
                        "request_json": record.request_json,
                        "response_json": record.response_json,
                        "latency_ms": record.latency_ms,
                    }
                    for record in records
                ],
                "total": total,
                "page": page,
                "page_size": page_size,
            }
