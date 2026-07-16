export type HistoryModule = 'disease' | 'yield' | 'advisor';

export interface HistoryItem {
  id: number;
  module: HistoryModule;
  model_name: string;
  timestamp: string;
  request_json: Record<string, unknown>;
  response_json: Record<string, unknown>;
  latency_ms: number;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  page_size: number;
}
