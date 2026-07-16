import type { YieldModelsResponse, YieldPredictRequest, YieldPredictionResponse } from '@/types/yield';

export const YIELD_MODELS: YieldModelsResponse = {
  default_model: 'xgb_full',
  models: [
    { key: 'xgb_full', algorithm: 'XGBoost', feature_set: 'full', r2: 0.9137, rmse: 3.47, mae: 0.78 },
    { key: 'rf_full', algorithm: 'Random Forest', feature_set: 'full', r2: 0.9021, rmse: 3.71, mae: 0.85 },
    { key: 'gb_full', algorithm: 'Gradient Boosting', feature_set: 'full', r2: 0.8944, rmse: 3.89, mae: 0.91 },
  ],
};

export const YIELD_MODEL_LABELS: Record<string, string> = {
  xgb_full: 'XGBoost',
  rf_full: 'Random Forest',
  gb_full: 'Gradient Boosting',
};

const CROP_BASE_YIELD: Record<string, number> = {
  Rice: 3.2,
  Wheat: 2.9,
  Maize: 2.6,
  Cotton: 0.48,
  Sugarcane: 68.4,
  Groundnut: 1.42,
  Soybean: 1.18,
  Potato: 22.6,
  Tomato: 18.3,
  Onion: 14.7,
};

export function mockYieldPredict(input: YieldPredictRequest): YieldPredictionResponse {
  const base = CROP_BASE_YIELD[input.crop] ?? 3.0;
  const rainfallFactor = 1 + (input.annual_rainfall - 1000) / 10000;
  const predicted = Math.max(0.1, base * rainfallFactor);

  return {
    predicted_yield: Number(predicted.toFixed(2)),
    unit: 'tonnes/ha',
    model_used: input.model ?? YIELD_MODELS.default_model,
    feature_set: 'full',
    inference_time_ms: 14,
  };
}
