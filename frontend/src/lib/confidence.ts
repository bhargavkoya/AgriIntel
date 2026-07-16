export type ConfidenceTone = 'success' | 'warning' | 'muted';

export interface ConfidencePhrase {
  label: string;
  tone: ConfidenceTone;
}

export function confidenceToPhrase(confidence: number, lowConfidenceWarning = false): ConfidencePhrase {
  if (lowConfidenceWarning || confidence < 0.65) {
    return { label: 'Not fully sure — worth a second look', tone: 'warning' };
  }
  if (confidence >= 0.85) {
    return { label: 'Very confident', tone: 'success' };
  }
  return { label: 'Fairly confident', tone: 'muted' };
}
