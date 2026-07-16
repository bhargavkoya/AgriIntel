import type { HistoryItem } from '@/types/history';

interface DiseaseSummaryResponse {
  prediction?: { class_name?: string };
}
interface YieldSummaryResponse {
  predicted_yield?: number;
  unit?: string;
  crop?: string;
}
interface AdvisorSummaryResponse {
  layer2?: { prediction?: string };
}

export function summarizeHistoryItem(item: HistoryItem): string {
  if (item.module === 'disease') {
    const response = item.response_json as DiseaseSummaryResponse;
    const className = response.prediction?.class_name;
    return className === 'Healthy' ? 'Plant check — looked healthy' : `Plant check — looked like ${className}`;
  }

  if (item.module === 'yield') {
    const response = item.response_json as YieldSummaryResponse;
    return `Harvest check — about ${response.predicted_yield} ${response.unit}${response.crop ? ` for ${response.crop}` : ''}`;
  }

  if (item.module === 'advisor') {
    const response = item.response_json as AdvisorSummaryResponse;
    return `Soil check — came back ${response.layer2?.prediction}`;
  }

  return 'Check completed';
}
