# API Contracts

REST API specification for the AgriIntel backend. All endpoints return JSON unless noted. Request/response schemas will be implemented as Pydantic models in Phase 3.

Base URL: `http://localhost:8000`

---

## Health

### `GET /api/health`

Application and artifact load status.

**Response 200:**

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "environment": "development",
  "modules": {
    "disease": {"loaded": false, "message": "Phase 1 stub"},
    "yield": {"loaded": false, "message": "Phase 1 stub"},
    "advisor": {"loaded": false, "message": "Phase 1 stub"}
  }
}
```

---

## Module A — Disease Detection

### `POST /api/disease/predict`

Upload a leaf image for disease classification.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | yes | Leaf image (JPEG, PNG) |
| `model` | string | no | Model name override (`custom`, `efficientnet`, `resnet`, `vgg16`). Defaults to `active_model` from `metrics.json` |

**Response 200:**

```json
{
  "prediction": {
    "class_name": "Apple Scab",
    "class_index": 0,
    "confidence": 0.94,
    "verdict": "DISEASED",
    "low_confidence_warning": false
  },
  "model_used": "efficientnet",
  "top_predictions": [
    {"class_name": "Apple Scab", "confidence": 0.94},
    {"class_name": "Black Rot", "confidence": 0.04},
    {"class_name": "Cedar Apple Rust", "confidence": 0.01}
  ],
  "inference_time_ms": 120
}
```

**Response 400:** Invalid file type or missing image

**Response 422:** Validation error

### `GET /api/disease/models`

List available disease detection models and benchmark metrics.

**Response 200:**

```json
{
  "active_model": "efficientnet",
  "models": [
    {
      "name": "custom",
      "file": "custom.keras",
      "input_size": [150, 150],
      "preprocess_mode": "rescale",
      "test_accuracy": 0.91
    },
    {
      "name": "efficientnet",
      "file": "efficientnet.keras",
      "input_size": [224, 224],
      "preprocess_mode": "none",
      "test_accuracy": 0.95
    }
  ]
}
```

---

## Module B — Yield Prediction

### `POST /api/yield/predict`

Predict crop yield from agricultural parameters.

**Content-Type:** `application/json`

**Request body:**

```json
{
  "crop": "Rice",
  "state": "Kerala",
  "season": "Kharif",
  "annual_rainfall": 3000.0,
  "area": 1000.0,
  "fertilizer": 150.0,
  "pesticide": 5.0,
  "year": 2020,
  "model": "xgb_full"
}
```

| Field | Type | Required | Maps to |
|-------|------|----------|---------|
| `crop` | string | yes | `Crop` |
| `state` | string | yes | `State` |
| `season` | string | yes | `Season` |
| `annual_rainfall` | float | yes | `Annual_Rainfall` |
| `area` | float | yes | `Area` |
| `fertilizer` | float | yes | `Fertilizer` (backend computes `Fertilizer_per_ha`) |
| `pesticide` | float | yes | `Pesticide` (backend computes `Pesticide_per_ha`) |
| `year` | int | yes | `Crop_Year` |
| `model` | string | no | Model variant key. Default from `best_model.json` |

Valid `model` values: `xgb_full`, `xgb_min`, `rf_full`, `rf_min`, `gb_full`, `gb_min`

**Response 200:**

```json
{
  "predicted_yield": 4.52,
  "unit": "tonnes/ha",
  "model_used": "xgb_full",
  "feature_set": "full",
  "inference_time_ms": 15,
  "feature_importance": [
    {"feature": "Crop_Rice", "importance": 0.18},
    {"feature": "Annual_Rainfall", "importance": 0.15}
  ]
}
```

`feature_importance` is optional — served from precomputed `shap_feature_importance.csv` when available.

**Response 422:** Validation error (missing fields, invalid types)

### `GET /api/yield/models`

List available yield prediction models and test metrics.

**Response 200:**

```json
{
  "default_model": "xgb_full",
  "models": [
    {
      "key": "xgb_full",
      "algorithm": "XGBoost",
      "feature_set": "full",
      "r2": 0.9137,
      "rmse": 3.47,
      "mae": 0.78
    }
  ]
}
```

---

## Module C — Soil Health Advisor

### `POST /api/advisor/recommend`

Run the 3-layer soil health advisory pipeline.

**Content-Type:** `application/json`

**Request body:**

```json
{
  "state": "Maharashtra",
  "district": "Pune",
  "soil_type": "Black",
  "ph": 6.2,
  "organic_carbon": 0.45,
  "nitrogen": 250.0,
  "phosphorus": 8.0,
  "potassium": 95.0,
  "sulphur": 12.0,
  "zinc": 0.8,
  "boron": 0.4,
  "iron": 5.0,
  "manganese": 3.0,
  "copper": 0.5,
  "rainfall": 800.0,
  "temperature": 28.0,
  "generate_llm": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `state` | string | yes | Indian state name (must match training data) |
| `district` | string | no | District name (used in LLM context) |
| `soil_type` | string | yes | Soil type (must match training data) |
| `ph` through `copper` | float | yes | Nutrient values per ICAR units |
| `rainfall` | float | no | Annual rainfall (mm) |
| `temperature` | float | no | Average temperature (°C) |
| `generate_llm` | bool | no | Enable Layer 3 LLM advisory. Default: `true` |

**Response 200:**

```json
{
  "layer1": {
    "nutrient_statuses": {
      "ph": {"value": 6.2, "status": "Acidic", "recommendation": "Apply agricultural lime..."},
      "nitrogen": {"value": 250.0, "status": "Deficient", "recommendation": "Apply urea..."}
    },
    "overall_label": "Moderate",
    "problem_count": 4
  },
  "layer2": {
    "prediction": "Moderate",
    "confidence": 0.87,
    "class_probabilities": {
      "Poor": 0.05,
      "Moderate": 0.87,
      "Good": 0.08
    }
  },
  "layer3": {
    "advisories": {
      "English": "Based on your soil analysis...",
      "Hindi": "आपके मिट्टी विश्लेषण के आधार पर...",
      "Telugu": "మీ నేల విశ్లేషణ ఆధారంగా..."
    }
  },
  "inference_time_ms": 2500
}
```

When `generate_llm` is `false`, `layer3` is `null`.

**Response 400:** Unknown `soil_type` or `state` (LabelEncoder error)

**Response 503:** LLM provider unavailable (missing API key or API error)

### `GET /api/advisor/languages`

List supported advisory languages.

**Response 200:**

```json
{
  "languages": [
    {"name": "English", "code": "en"},
    {"name": "Hindi", "code": "hi"},
    {"name": "Telugu", "code": "te"}
  ]
}
```

---

## Prediction History

### `GET /api/history`

Retrieve paginated prediction history.

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `module` | string | — | Filter by module (`disease`, `yield`, `advisor`) |
| `page` | int | 1 | Page number |
| `page_size` | int | 20 | Results per page (max 100) |

**Response 200:**

```json
{
  "items": [
    {
      "id": 1,
      "module": "disease",
      "model_name": "efficientnet",
      "timestamp": "2026-07-10T12:00:00Z",
      "request_json": {"filename": "leaf.jpg"},
      "response_json": {"prediction": {"class_name": "Healthy"}},
      "latency_ms": 120
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

---

## Error Response Format

All error responses follow a consistent structure:

```json
{
  "detail": "Human-readable error message",
  "error_code": "VALIDATION_ERROR"
}
```

| HTTP Status | When |
|-------------|------|
| 400 | Bad request (invalid input, unknown category) |
| 404 | Resource not found |
| 422 | Pydantic validation failure |
| 500 | Internal server error |
| 503 | External service unavailable (LLM API) |

---

## CORS

Frontend dev server (`http://localhost:5173`) is allowed in development. Production origins configured via `CORS_ORIGINS` environment variable.
