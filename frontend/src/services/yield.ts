import { delay } from '@/utils';
import { YIELD_MODELS, mockYieldPredict } from '@/mocks/yieldMock';
import type { YieldModelsResponse, YieldPredictRequest, YieldPredictionResponse } from '@/types/yield';

export async function getYieldModels(): Promise<YieldModelsResponse> {
  await delay(200);
  return YIELD_MODELS;
}

export async function predictYield(input: YieldPredictRequest): Promise<YieldPredictionResponse> {
  await delay(1000);
  return mockYieldPredict(input);
}
