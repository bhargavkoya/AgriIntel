import apiClient from '@/services/api';
import type { SoilAdvisoryRequest, SoilAdvisoryResponse } from '@/types/soil';

export async function getSoilAdvice(input: SoilAdvisoryRequest): Promise<SoilAdvisoryResponse> {
  const response = await apiClient.post<SoilAdvisoryResponse>('/advisor/recommend', input);
  return response.data;
}
