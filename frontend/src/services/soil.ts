import { delay } from '@/utils';
import { mockSoilAdvisory } from '@/mocks/soilMock';
import type { SoilAdvisoryRequest, SoilAdvisoryResponse } from '@/types/soil';

export async function getSoilAdvice(input: SoilAdvisoryRequest): Promise<SoilAdvisoryResponse> {
  await delay(1800);
  return mockSoilAdvisory(input);
}
