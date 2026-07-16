export interface DiseasePrediction {
  class_name: string;
  class_index: number;
  confidence: number;
  verdict: string;
  low_confidence_warning: boolean;
}

export interface TopPrediction {
  class_name: string;
  confidence: number;
}

export interface DiseasePredictionResponse {
  prediction: DiseasePrediction;
  model_used: string;
  top_predictions: TopPrediction[];
  inference_time_ms: number;
}

export interface DiseaseModel {
  name: string;
  file: string;
  input_size: [number, number];
  preprocess_mode: string;
  test_accuracy: number;
}

export interface DiseaseModelsResponse {
  active_model: string;
  models: DiseaseModel[];
}
