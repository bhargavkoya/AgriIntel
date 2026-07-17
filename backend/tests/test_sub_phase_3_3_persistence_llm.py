"""Sub-phase 3.3 tests — DB persistence, history endpoint, and LLM wiring."""

import asyncio
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.integrations.llm.base import LLMProviderError
from app.integrations.llm.groq_provider import create_groq_provider
from app.main import app
from app.repositories.contact_repository import ContactRepository
from app.repositories.file_repository import FileRepository
from app.repositories.prediction_repository import PredictionRepository
from app.services.advisor_service import AdvisorService
from app.services.history_helper import persist_prediction
from tests.fixtures.build_artifacts import build_advisor_artifacts
from tests.test_sub_phase_3_2_inference import ADVISOR_REQUEST


class FakeLLMProvider:
    def generate(self, prompt: str, *, temperature: float | None = None, max_tokens: int | None = None) -> str:
        return "Fake advisory text."


def test_prediction_repository_create_and_list(db_session_factory) -> None:
    repository = PredictionRepository(session_factory=db_session_factory)

    first_id = asyncio.run(
        repository.create(
            module="disease",
            model_name="efficientnet",
            request_json={"filename": "leaf.jpg"},
            response_json={"prediction": {"class_name": "Healthy"}},
            latency_ms=120,
        )
    )
    assert first_id == 1

    asyncio.run(
        repository.create(
            module="yield",
            model_name="xgb_full",
            request_json={"crop": "Rice"},
            response_json={"predicted_yield": 4.2},
            latency_ms=15,
        )
    )

    all_history = asyncio.run(repository.list())
    assert all_history["total"] == 2
    assert len(all_history["items"]) == 2
    assert all_history["items"][0]["model_name"] == "xgb_full"  # newest first

    disease_only = asyncio.run(repository.list(module="disease"))
    assert disease_only["total"] == 1
    assert disease_only["items"][0]["module"] == "disease"

    paged = asyncio.run(repository.list(page=1, page_size=1))
    assert paged["total"] == 2
    assert len(paged["items"]) == 1

    found = asyncio.run(repository.get_by_id(first_id))
    assert found is not None
    assert found["module"] == "disease"
    assert found["model_name"] == "efficientnet"

    assert asyncio.run(repository.get_by_id(999)) is None


def test_file_repository_save_and_get(tmp_path, db_session_factory) -> None:
    repository = FileRepository(
        settings=Settings(upload_dir=str(tmp_path / "uploads")),
        session_factory=db_session_factory,
    )

    saved_path = asyncio.run(repository.save(filename="leaf.jpg", content=b"fake-image-bytes", module="disease"))
    assert Path(saved_path).exists()
    assert Path(saved_path).read_bytes() == b"fake-image-bytes"

    metadata = asyncio.run(repository.get(1))
    assert metadata is not None
    assert metadata["filename"] == "leaf.jpg"

    assert asyncio.run(repository.get(999)) is None


def test_contact_repository_create(db_session_factory) -> None:
    repository = ContactRepository(session_factory=db_session_factory)

    message_id = asyncio.run(
        repository.create(name="Test Farmer", email="farmer@example.com", role="farmer", message="Hello!")
    )
    assert message_id == 1


def test_persist_prediction_swallows_repository_errors() -> None:
    class BrokenRepository:
        async def create(self, **kwargs):
            raise RuntimeError("db down")

    # Must not raise - a history-write failure should never fail the request.
    asyncio.run(
        persist_prediction(
            BrokenRepository(),
            module="disease",
            model_name="custom",
            request_json={},
            response_json={},
            latency_ms=0,
        )
    )


def test_history_endpoint_returns_persisted_predictions() -> None:
    with TestClient(app) as client:
        repository = PredictionRepository()
        asyncio.run(
            repository.create(
                module="yield",
                model_name="xgb_full",
                request_json={"crop": "Rice"},
                response_json={"predicted_yield": 4.2},
                latency_ms=12,
            )
        )

        response = client.get("/api/history?module=yield&page=1&page_size=20")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert any(item["model_name"] == "xgb_full" for item in body["items"])


def test_advisor_recommend_with_fake_llm_returns_layer3(tmp_path, db_session_factory) -> None:
    build_advisor_artifacts(tmp_path)
    service = AdvisorService(
        settings=Settings(artifacts_advisor_path=str(tmp_path)),
        llm_provider=FakeLLMProvider(),
        prediction_repository=PredictionRepository(session_factory=db_session_factory),
    )
    asyncio.run(service.load())

    result = asyncio.run(service.recommend(request_data=ADVISOR_REQUEST, generate_llm=True))

    assert result["layer3"] is not None
    assert result["layer3"]["advisories"]["English"] == "Fake advisory text."


def test_groq_provider_raises_without_api_key() -> None:
    provider = create_groq_provider(api_key="")

    with pytest.raises(LLMProviderError):
        provider.generate("test prompt")
