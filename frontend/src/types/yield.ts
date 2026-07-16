export interface YieldPredictRequest {
  crop: string;
  state: string;
  season: string;
  annual_rainfall: number;
  area: number;
  fertilizer: number;
  pesticide: number;
  year: number;
  model?: string;
}

export interface YieldFeatureImportance {
  feature: string;
  importance: number;
}

export interface YieldPredictionResponse {
  predicted_yield: number;
  unit: string;
  model_used: string;
  feature_set: string;
  inference_time_ms: number;
  feature_importance?: YieldFeatureImportance[];
}

export interface YieldModel {
  key: string;
  algorithm: string;
  feature_set: string;
  r2: number;
  rmse: number;
  mae: number;
}

export interface YieldModelsResponse {
  default_model: string;
  models: YieldModel[];
}
