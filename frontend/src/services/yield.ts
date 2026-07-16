import apiClient from '@/services/api';
import type { YieldModelsResponse, YieldPredictRequest, YieldPredictionResponse } from '@/types/yield';

export async function getYieldModels(): Promise<YieldModelsResponse> {
  const response = await apiClient.get<YieldModelsResponse>('/yield/models');
  return response.data;
}

export async function predictYield(input: YieldPredictRequest): Promise<YieldPredictionResponse> {
  const request = { ...input, model: input.model || undefined };
  const response = await apiClient.post<YieldPredictionResponse>('/yield/predict', request);
  return response.data;
}
