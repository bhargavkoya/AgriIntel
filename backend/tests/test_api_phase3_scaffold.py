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
    assert "/api/history/{item_id}" in paths


def test_yield_predict_returns_503_without_artifacts() -> None:
    # No real artifacts are checked into the repo, so the service reports
    # unloaded and the route must fail fast rather than fabricate a prediction.
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

    assert response.status_code == 503
    body = response.json()
    assert body["error_code"] == "SERVICE_UNAVAILABLE"
    assert "detail" in body


def test_validation_error_returns_error_code() -> None:
    with TestClient(app) as client:
        response = client.post("/api/yield/predict", json={"crop": "Rice"})

    assert response.status_code == 422
    body = response.json()
    assert body["error_code"] == "VALIDATION_ERROR"
    assert isinstance(body["detail"], str)


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


def test_history_item_not_found_returns_404_with_error_code() -> None:
    with TestClient(app) as client:
        response = client.get("/api/history/999")

    assert response.status_code == 404
    body = response.json()
    assert body["error_code"] == "NOT_FOUND"
    assert "999" in body["detail"]
