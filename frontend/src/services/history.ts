import { delay } from '@/utils';
import { findHistoryItem, paginateHistory } from '@/mocks/historyMock';
import type { HistoryItem, HistoryResponse } from '@/types/history';

export async function getHistory(page = 1, pageSize = 20): Promise<HistoryResponse> {
  await delay(400);
  return paginateHistory(page, pageSize);
}

export async function getHistoryItem(id: number): Promise<HistoryItem | null> {
  await delay(300);
  return findHistoryItem(id);
}
