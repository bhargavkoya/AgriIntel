"""Sub-phase 3.2 tests — real inference against synthetic fixture artifacts.

Real Colab-exported artifacts aren't in this repo (gitignored, manually
uploaded), so these exercise the same code path against tiny synthetic
artifacts built by tests/fixtures/build_artifacts.py. Each service gets an
isolated PredictionRepository/FileRepository (via db_session_factory /
tmp_path) so these tests never touch the real data/agriintel.db or
data/uploads/.
"""

import asyncio
from io import BytesIO

import pytest
from PIL import Image

from app.core.config import Settings
from app.repositories.file_repository import FileRepository
from app.repositories.prediction_repository import PredictionRepository
from app.services.advisor_service import AdvisorService
from app.services.disease_service import DiseaseService
from app.services.yield_service import YieldService
from tests.fixtures.build_artifacts import build_advisor_artifacts, build_disease_artifacts, build_yield_artifacts

ADVISOR_REQUEST = {
    "state": "Kerala",
    "district": "Kochi",
    "soil_type": "Red",
    "ph": 6.2,
    "organic_carbon": 0.45,
    "nitrogen": 250.0,
    "phosphorus": 8.0,
    "potassium": 95.0,
    "sulphur": 12.0,
    "zinc": 0.4,
    "boron": 0.3,
    "iron": 3.0,
    "manganese": 1.0,
    "copper": 0.1,
    "rainfall": 800.0,
    "temperature": 28.0,
}


def test_disease_predict_returns_real_prediction(tmp_path, db_session_factory) -> None:
    build_disease_artifacts(tmp_path)
    upload_settings = Settings(upload_dir=str(tmp_path / "uploads"))
    service = DiseaseService(
        settings=Settings(artifacts_disease_path=str(tmp_path)),
        prediction_repository=PredictionRepository(session_factory=db_session_factory),
        file_repository=FileRepository(settings=upload_settings, session_factory=db_session_factory),
    )

    asyncio.run(service.load())
    assert service.is_loaded, service.status

    image = Image.new("RGB", (16, 16), color=(120, 180, 90))
    buffer = BytesIO()
    image.save(buffer, format="PNG")

    result = asyncio.run(service.predict(image_bytes=buffer.getvalue(), filename="leaf.png"))

    assert result["prediction"]["class_name"] in {"Diseased", "Healthy"}
    assert result["prediction"]["class_index"] in {0, 1}
    assert 0.0 <= result["prediction"]["confidence"] <= 1.0
    assert result["model_used"] == "custom"
    assert len(result["top_predictions"]) == 2
    assert result["inference_time_ms"] >= 0


def test_disease_predict_unknown_model_raises_key_error(tmp_path, db_session_factory) -> None:
    build_disease_artifacts(tmp_path)
    service = DiseaseService(
        settings=Settings(artifacts_disease_path=str(tmp_path)),
        prediction_repository=PredictionRepository(session_factory=db_session_factory),
        file_repository=FileRepository(
            settings=Settings(upload_dir=str(tmp_path / "uploads")), session_factory=db_session_factory
        ),
    )
    asyncio.run(service.load())

    image = Image.new("RGB", (16, 16), color=(0, 0, 0))
    buffer = BytesIO()
    image.save(buffer, format="PNG")

    with pytest.raises(KeyError):
        asyncio.run(service.predict(image_bytes=buffer.getvalue(), model_name="not-a-real-model"))


def test_yield_predict_returns_real_prediction(tmp_path, db_session_factory) -> None:
    build_yield_artifacts(tmp_path)
    service = YieldService(
        settings=Settings(artifacts_yield_path=str(tmp_path)),
        prediction_repository=PredictionRepository(session_factory=db_session_factory),
    )

    asyncio.run(service.load())
    assert service.is_loaded, service.status

    request_data = {
        "crop": "Rice",
        "state": "Kerala",
        "season": "Kharif",
        "annual_rainfall": 1800.0,
        "area": 25.0,
        "fertilizer": 150.0,
        "pesticide": 5.0,
        "year": 2020,
        "model": None,
    }

    result = asyncio.run(service.predict(request_data=request_data, model_key=None))

    assert result["model_used"] == "xgb_full"
    assert result["feature_set"] == "full"
    assert result["predicted_yield"] >= 0.0
    assert result["unit"] == "tonnes/ha"
    assert result["inference_time_ms"] >= 0


def test_advisor_recommend_returns_real_layers(tmp_path, db_session_factory) -> None:
    build_advisor_artifacts(tmp_path)
    service = AdvisorService(
        settings=Settings(artifacts_advisor_path=str(tmp_path)),
        prediction_repository=PredictionRepository(session_factory=db_session_factory),
    )

    asyncio.run(service.load())
    assert service.is_loaded, service.status

    result = asyncio.run(service.recommend(request_data=ADVISOR_REQUEST, generate_llm=False))

    assert result["layer1"]["overall_label"] in {"Poor", "Moderate", "Good"}
    assert set(result["layer1"]["nutrient_statuses"]) == set(
        [
            "ph",
            "organic_carbon",
            "nitrogen",
            "phosphorus",
            "potassium",
            "sulphur",
            "zinc",
            "boron",
            "iron",
            "manganese",
            "copper",
        ]
    )
    assert result["layer2"]["prediction"] in {"Poor", "Moderate", "Good"}
    assert abs(sum(result["layer2"]["class_probabilities"].values()) - 1.0) < 0.01
    assert result["layer3"] is None


def test_advisor_recommend_unknown_soil_type_raises(tmp_path, db_session_factory) -> None:
    build_advisor_artifacts(tmp_path)
    service = AdvisorService(
        settings=Settings(artifacts_advisor_path=str(tmp_path)),
        prediction_repository=PredictionRepository(session_factory=db_session_factory),
    )
    asyncio.run(service.load())

    bad_request = {**ADVISOR_REQUEST, "soil_type": "NotARealSoilType"}

    with pytest.raises(ValueError):
        asyncio.run(service.recommend(request_data=bad_request, generate_llm=False))
