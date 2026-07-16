import apiClient from '@/services/api';
import type { DiseaseModelsResponse, DiseasePredictionResponse } from '@/types/disease';

export async function getDiseaseModels(): Promise<DiseaseModelsResponse> {
  const response = await apiClient.get<DiseaseModelsResponse>('/disease/models');
  return response.data;
}

export async function predictDisease(file: File, model: string): Promise<DiseasePredictionResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (model) formData.append('model', model);

  const response = await apiClient.post<DiseasePredictionResponse>('/disease/predict', formData, {
    headers: { 'Content-Type': undefined },
  });
  return response.data;
}
