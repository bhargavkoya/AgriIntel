import { delay } from '@/utils';
import { DISEASE_MODELS, pickDiseaseMock } from '@/mocks/diseaseMock';
import type { DiseaseModelsResponse, DiseasePredictionResponse } from '@/types/disease';

export async function getDiseaseModels(): Promise<DiseaseModelsResponse> {
  await delay(200);
  return DISEASE_MODELS;
}

export async function predictDisease(
  _file: File,
  model: string
): Promise<DiseasePredictionResponse> {
  await delay(1200);
  return pickDiseaseMock(model);
}
