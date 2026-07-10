"""Phase 3.1 API scaffold tests."""

from fastapi.testclient import TestClient

from app.main import app


def test_services_initialized_on_startup() -> None:
    with TestClient(app) as client:
        assert hasattr(client.app.state, "disease_service")
        assert hasattr(client.app.state, "yield_service")
        assert hasattr(client.app.state, "advisor_service")


def test_openapi_contains_phase3_routes() -> None:
    with TestClient(app) as client:
        paths = client.get("/openapi.json").json()["paths"]

    assert "/api/health" in paths
    assert "/api/disease/predict" in paths
    assert "/api/disease/models" in paths
    assert "/api/yield/predict" in paths
    assert "/api/yield/models" in paths
    assert "/api/advisor/recommend" in paths
    assert "/api/advisor/languages" in paths
    assert "/api/history" in paths


def test_yield_predict_scaffold_response() -> None:
    payload = {
        "crop": "Rice",
        "state": "Kerala",
        "season": "Kharif",
        "annual_rainfall": 3000.0,
        "area": 1000.0,
        "fertilizer": 150.0,
        "pesticide": 5.0,
        "year": 2020,
    }

    with TestClient(app) as client:
        response = client.post("/api/yield/predict", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["model_used"]
    assert body["unit"] == "tonnes/ha"
    assert "feature_set" in body


def test_advisor_languages_scaffold_response() -> None:
    with TestClient(app) as client:
        response = client.get("/api/advisor/languages")

    assert response.status_code == 200
    body = response.json()
    assert "languages" in body
    assert any(item["name"] == "English" for item in body["languages"])


def test_history_scaffold_response() -> None:
    with TestClient(app) as client:
        response = client.get("/api/history?page=1&page_size=20")

    assert response.status_code == 200
    body = response.json()
    assert body == {"items": [], "total": 0, "page": 1, "page_size": 20}
