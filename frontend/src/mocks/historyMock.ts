import type { HistoryItem } from '@/types/history';
import type { DiseasePredictionResponse } from '@/types/disease';
import type { YieldPredictRequest } from '@/types/yield';
import type { SoilAdvisoryRequest } from '@/types/soil';
import { mockYieldPredict } from './yieldMock';
import { mockSoilAdvisory } from './soilMock';

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/** HistoryItem's request/response fields mirror the backend's untyped JSON blob contract — narrow it locally for construction, then erase the type here. */
function asJson<T extends object>(value: T): Record<string, unknown> {
  return value as unknown as Record<string, unknown>;
}

const DISEASE_CLASS_INDEX: Record<string, number> = {
  Healthy: 0,
  'Apple Scab': 1,
  'Black Rot': 2,
  'Cedar Apple Rust': 3,
};

function diseaseResponse(className: string, confidence: number, model: string, low = false): DiseasePredictionResponse {
  return {
    prediction: {
      class_name: className,
      class_index: DISEASE_CLASS_INDEX[className] ?? 0,
      confidence,
      verdict: className === 'Healthy' ? 'HEALTHY' : 'DISEASED',
      low_confidence_warning: low,
    },
    model_used: model,
    top_predictions: [{ class_name: className, confidence }],
    inference_time_ms: 118,
  };
}

const yieldRequestRice: YieldPredictRequest = {
  crop: 'Rice',
  state: 'Andhra Pradesh',
  season: 'Kharif',
  annual_rainfall: 1180,
  area: 2.4,
  fertilizer: 142,
  pesticide: 0.38,
  year: 2026,
  model: 'xgb_full',
};

const yieldRequestWheat: YieldPredictRequest = {
  crop: 'Wheat',
  state: 'Punjab',
  season: 'Rabi',
  annual_rainfall: 780,
  area: 3.1,
  fertilizer: 110,
  pesticide: 0.25,
  year: 2025,
  model: 'rf_full',
};

const yieldRequestCotton: YieldPredictRequest = {
  crop: 'Cotton',
  state: 'Gujarat',
  season: 'Kharif',
  annual_rainfall: 650,
  area: 1.8,
  fertilizer: 95,
  pesticide: 0.4,
  year: 2025,
  model: 'gb_full',
};

const soilRequestMaharashtra: SoilAdvisoryRequest = {
  state: 'Maharashtra',
  soil_type: 'Black',
  ph: 6.2,
  organic_carbon: 0.45,
  nitrogen: 250,
  phosphorus: 8,
  potassium: 95,
  sulphur: 12,
  zinc: 0.8,
  boron: 0.4,
  iron: 5,
  manganese: 3,
  copper: 0.5,
  rainfall: 800,
  temperature: 28,
  generate_llm: true,
};

const soilRequestKarnataka: SoilAdvisoryRequest = {
  state: 'Karnataka',
  soil_type: 'Red Laterite',
  ph: 6.8,
  organic_carbon: 0.85,
  nitrogen: 320,
  phosphorus: 18,
  potassium: 180,
  sulphur: 16,
  zinc: 1.2,
  boron: 0.7,
  iron: 6.5,
  manganese: 4,
  copper: 0.9,
  rainfall: 900,
  temperature: 26,
  generate_llm: true,
};

export const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: 10,
    module: 'disease',
    model_name: 'efficientnet',
    timestamp: hoursAgo(3),
    request_json: { filename: 'leaf.jpg' },
    response_json: asJson(diseaseResponse('Healthy', 0.97, 'efficientnet')),
    latency_ms: 118,
  },
  {
    id: 9,
    module: 'yield',
    model_name: 'xgb_full',
    timestamp: hoursAgo(20),
    request_json: asJson(yieldRequestRice),
    response_json: asJson(mockYieldPredict(yieldRequestRice)),
    latency_ms: 14,
  },
  {
    id: 8,
    module: 'advisor',
    model_name: 'rf_soil_health',
    timestamp: hoursAgo(30),
    request_json: asJson(soilRequestMaharashtra),
    response_json: asJson(mockSoilAdvisory(soilRequestMaharashtra)),
    latency_ms: 2380,
  },
  {
    id: 7,
    module: 'disease',
    model_name: 'efficientnet',
    timestamp: hoursAgo(48),
    request_json: { filename: 'leaf2.jpg' },
    response_json: asJson(diseaseResponse('Apple Scab', 0.94, 'efficientnet')),
    latency_ms: 124,
  },
  {
    id: 6,
    module: 'yield',
    model_name: 'rf_full',
    timestamp: hoursAgo(72),
    request_json: asJson(yieldRequestWheat),
    response_json: asJson(mockYieldPredict(yieldRequestWheat)),
    latency_ms: 16,
  },
  {
    id: 5,
    module: 'advisor',
    model_name: 'rf_soil_health',
    timestamp: hoursAgo(96),
    request_json: asJson(soilRequestKarnataka),
    response_json: asJson(mockSoilAdvisory(soilRequestKarnataka)),
    latency_ms: 2210,
  },
  {
    id: 4,
    module: 'disease',
    model_name: 'resnet',
    timestamp: hoursAgo(150),
    request_json: { filename: 'leaf3.jpg' },
    response_json: asJson(diseaseResponse('Black Rot', 0.58, 'resnet', true)),
    latency_ms: 131,
  },
  {
    id: 3,
    module: 'yield',
    model_name: 'gb_full',
    timestamp: hoursAgo(200),
    request_json: asJson(yieldRequestCotton),
    response_json: asJson(mockYieldPredict(yieldRequestCotton)),
    latency_ms: 15,
  },
];

export function paginateHistory(page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const items = HISTORY_ITEMS.slice(start, start + pageSize);
  return { items, total: HISTORY_ITEMS.length, page, page_size: pageSize };
}

export function findHistoryItem(id: number): HistoryItem | null {
  return HISTORY_ITEMS.find((item) => item.id === id) ?? null;
}
