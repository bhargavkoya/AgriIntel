import { isAxiosError } from 'axios';
import apiClient from '@/services/api';
import type { HistoryItem, HistoryModule, HistoryResponse } from '@/types/history';

export async function getHistory(
  page = 1,
  pageSize = 20,
  module?: HistoryModule
): Promise<HistoryResponse> {
  const response = await apiClient.get<HistoryResponse>('/history', {
    params: { page, page_size: pageSize, module },
  });
  return response.data;
}

export async function getHistoryItem(id: number): Promise<HistoryItem | null> {
  try {
    const response = await apiClient.get<HistoryItem>(`/history/${id}`);
    return response.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}
