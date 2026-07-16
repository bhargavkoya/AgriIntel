import type { SoilAdvisoryRequest } from '@/types/soil';

interface NutrientConfig {
  key: keyof SoilAdvisoryRequest;
  label: string;
  unit: string;
}

export const NUTRIENT_CONFIG: NutrientConfig[] = [
  { key: 'ph', label: 'Soil acidity (pH)', unit: '' },
  { key: 'organic_carbon', label: 'Organic carbon', unit: '%' },
  { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'kg/ha' },
  { key: 'phosphorus', label: 'Phosphorus (P)', unit: 'kg/ha' },
  { key: 'potassium', label: 'Potassium (K)', unit: 'kg/ha' },
  { key: 'sulphur', label: 'Sulphur (S)', unit: 'ppm' },
  { key: 'zinc', label: 'Zinc (Zn)', unit: 'ppm' },
  { key: 'boron', label: 'Boron (B)', unit: 'ppm' },
  { key: 'iron', label: 'Iron (Fe)', unit: 'ppm' },
  { key: 'manganese', label: 'Manganese (Mn)', unit: 'ppm' },
  { key: 'copper', label: 'Copper (Cu)', unit: 'ppm' },
];
