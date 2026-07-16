export const DISEASE_MODEL_LABELS: Record<string, string> = {
  custom: 'Custom',
  efficientnet: 'EfficientNet-B0',
  resnet: 'ResNet50',
  vgg16: 'VGG16',
};

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
