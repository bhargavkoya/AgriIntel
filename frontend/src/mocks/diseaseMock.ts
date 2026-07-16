import type { DiseaseModelsResponse, DiseasePredictionResponse } from '@/types/disease';

export const DISEASE_MODELS: DiseaseModelsResponse = {
  active_model: 'efficientnet',
  models: [
    { name: 'custom', file: 'custom.keras', input_size: [150, 150], preprocess_mode: 'rescale', test_accuracy: 0.91 },
    { name: 'efficientnet', file: 'efficientnet.keras', input_size: [224, 224], preprocess_mode: 'none', test_accuracy: 0.95 },
    { name: 'resnet', file: 'resnet.keras', input_size: [224, 224], preprocess_mode: 'none', test_accuracy: 0.94 },
    { name: 'vgg16', file: 'vgg16.keras', input_size: [224, 224], preprocess_mode: 'none', test_accuracy: 0.94 },
  ],
};

export const DISEASE_MODEL_LABELS: Record<string, string> = {
  custom: 'Custom',
  efficientnet: 'EfficientNet-B0',
  resnet: 'ResNet50',
  vgg16: 'VGG16',
};

const DISEASE_RESULT_VARIANTS: DiseasePredictionResponse[] = [
  {
    prediction: {
      class_name: 'Healthy',
      class_index: 0,
      confidence: 0.97,
      verdict: 'HEALTHY',
      low_confidence_warning: false,
    },
    model_used: 'efficientnet',
    top_predictions: [{ class_name: 'Healthy', confidence: 0.97 }],
    inference_time_ms: 118,
  },
  {
    prediction: {
      class_name: 'Apple Scab',
      class_index: 1,
      confidence: 0.94,
      verdict: 'DISEASED',
      low_confidence_warning: false,
    },
    model_used: 'efficientnet',
    top_predictions: [{ class_name: 'Apple Scab', confidence: 0.94 }],
    inference_time_ms: 124,
  },
  {
    prediction: {
      class_name: 'Black Rot',
      class_index: 2,
      confidence: 0.58,
      verdict: 'DISEASED',
      low_confidence_warning: true,
    },
    model_used: 'efficientnet',
    top_predictions: [{ class_name: 'Black Rot', confidence: 0.58 }],
    inference_time_ms: 131,
  },
  {
    prediction: {
      class_name: 'Cedar Apple Rust',
      class_index: 3,
      confidence: 0.88,
      verdict: 'DISEASED',
      low_confidence_warning: false,
    },
    model_used: 'efficientnet',
    top_predictions: [{ class_name: 'Cedar Apple Rust', confidence: 0.88 }],
    inference_time_ms: 121,
  },
];

export function pickDiseaseMock(model: string): DiseasePredictionResponse {
  const variant = DISEASE_RESULT_VARIANTS[Math.floor(Math.random() * DISEASE_RESULT_VARIANTS.length)];
  return { ...variant, model_used: model };
}

export const DISEASE_TREATMENT: Record<string, { advice: string; severity: 'None' | 'Moderate' | 'High' }> = {
  Healthy: { advice: 'No action needed right now. Keep up your usual care.', severity: 'None' },
  'Apple Scab': {
    advice: 'Spray a fungicide (Mancozeb or Captan) soon, and pick off and remove affected leaves.',
    severity: 'Moderate',
  },
  'Black Rot': {
    advice: 'Cut off infected branches and spray a copper-based fungicide. Give the plant more space for airflow.',
    severity: 'High',
  },
  'Cedar Apple Rust': {
    advice: 'Use a myclobutanil-based fungicide, and remove any nearby cedar or juniper trees if you can.',
    severity: 'Moderate',
  },
};
