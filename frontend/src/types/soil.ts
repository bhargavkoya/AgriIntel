export interface SoilAdvisoryRequest {
  state: string;
  district?: string;
  soil_type: string;
  ph: number;
  organic_carbon: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  sulphur: number;
  zinc: number;
  boron: number;
  iron: number;
  manganese: number;
  copper: number;
  rainfall?: number;
  temperature?: number;
  generate_llm?: boolean;
}

export interface NutrientStatusEntry {
  value: number;
  status: string;
  recommendation: string;
}

export interface SoilLayer1 {
  nutrient_statuses: Record<string, NutrientStatusEntry>;
  overall_label: string;
  problem_count: number;
}

export interface SoilLayer2 {
  prediction: string;
  confidence: number;
  class_probabilities: Record<string, number>;
}

export type AdvisoryLanguage = 'English' | 'Hindi' | 'Telugu';

export interface SoilLayer3 {
  advisories: Record<AdvisoryLanguage, string>;
}

export interface SoilAdvisoryResponse {
  layer1: SoilLayer1;
  layer2: SoilLayer2;
  layer3: SoilLayer3 | null;
  inference_time_ms: number;
}
