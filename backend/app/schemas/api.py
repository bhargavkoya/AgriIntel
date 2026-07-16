"""API request and response schemas for AgriIntel Phase 3."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ModuleStatus(BaseModel):
    loaded: bool
    message: str
    missing_files: list[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    modules: dict[str, ModuleStatus]


class ErrorResponse(BaseModel):
    detail: str
    error_code: str


class DiseasePredictionSummary(BaseModel):
    class_name: str
    class_index: int
    confidence: float
    verdict: str
    low_confidence_warning: bool


class DiseaseTopPrediction(BaseModel):
    class_name: str
    confidence: float


class DiseasePredictResponse(BaseModel):
    prediction: DiseasePredictionSummary
    model_used: str
    top_predictions: list[DiseaseTopPrediction]
    inference_time_ms: int


class DiseaseModelInfo(BaseModel):
    name: str
    file: str
    input_size: tuple[int, int]
    preprocess_mode: str
    test_accuracy: float | None = None


class DiseaseModelsResponse(BaseModel):
    active_model: str
    models: list[DiseaseModelInfo]


class YieldPredictRequest(BaseModel):
    crop: str
    state: str
    season: str
    annual_rainfall: float = Field(..., ge=0)
    area: float = Field(..., gt=0)
    fertilizer: float = Field(..., ge=0)
    pesticide: float = Field(..., ge=0)
    year: int
    model: str | None = None


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float


class YieldPredictResponse(BaseModel):
    predicted_yield: float
    unit: str
    model_used: str
    feature_set: str
    inference_time_ms: int
    feature_importance: list[FeatureImportanceItem] | None = None


class YieldModelInfo(BaseModel):
    key: str
    algorithm: str
    feature_set: str
    r2: float | None = None
    rmse: float | None = None
    mae: float | None = None


class YieldModelsResponse(BaseModel):
    default_model: str
    models: list[YieldModelInfo]


class AdvisorRecommendRequest(BaseModel):
    state: str
    district: str | None = None
    soil_type: str
    ph: float
    organic_carbon: float
    nitrogen: float
    phosphorus: float
    potassium: float
    sulphur: float
    zinc: float
    boron: float
    iron: float
    manganese: float
    copper: float
    rainfall: float | None = None
    temperature: float | None = None
    generate_llm: bool = True


class NutrientStatusItem(BaseModel):
    value: float
    status: str
    recommendation: str | None = None


class AdvisorLayer1Response(BaseModel):
    nutrient_statuses: dict[str, NutrientStatusItem]
    overall_label: str
    problem_count: int


class AdvisorLayer2Response(BaseModel):
    prediction: str
    confidence: float
    class_probabilities: dict[str, float]


class AdvisorLayer3Response(BaseModel):
    advisories: dict[str, str]


class AdvisorRecommendResponse(BaseModel):
    layer1: AdvisorLayer1Response
    layer2: AdvisorLayer2Response
    layer3: AdvisorLayer3Response | None
    inference_time_ms: int


class AdvisorLanguageItem(BaseModel):
    name: str
    code: str


class AdvisorLanguagesResponse(BaseModel):
    languages: list[AdvisorLanguageItem]


class HistoryItem(BaseModel):
    id: int
    module: str
    model_name: str
    timestamp: str
    request_json: dict
    response_json: dict
    latency_ms: int

    model_config = ConfigDict(extra="ignore")


class HistoryListResponse(BaseModel):
    items: list[HistoryItem]
    total: int
    page: int
    page_size: int
