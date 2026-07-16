import type {
  AdvisoryLanguage,
  NutrientStatusEntry,
  SoilAdvisoryRequest,
  SoilAdvisoryResponse,
} from '@/types/soil';

interface NutrientConfig {
  key: keyof SoilAdvisoryRequest;
  label: string;
  unit: string;
  low: number;
  high: number;
  isPH?: boolean;
  deficientAdvice: string;
  excessiveAdvice: string;
}

export const NUTRIENT_CONFIG: NutrientConfig[] = [
  {
    key: 'ph',
    label: 'Soil acidity (pH)',
    unit: '',
    low: 6.5,
    high: 7.5,
    isPH: true,
    deficientAdvice: 'Your soil is acidic. Adding agricultural lime can help balance it.',
    excessiveAdvice: 'Your soil is alkaline. Adding gypsum or organic matter can help balance it.',
  },
  {
    key: 'organic_carbon',
    label: 'Organic carbon',
    unit: '%',
    low: 0.5,
    high: 1.5,
    deficientAdvice: 'Add compost or crop residue to build up organic matter.',
    excessiveAdvice: 'Organic matter is high — no action needed.',
  },
  {
    key: 'nitrogen',
    label: 'Nitrogen (N)',
    unit: 'kg/ha',
    low: 280,
    high: 560,
    deficientAdvice: 'Add urea to boost nitrogen levels.',
    excessiveAdvice: 'Nitrogen is high — cut back on nitrogen fertiliser this season.',
  },
  {
    key: 'phosphorus',
    label: 'Phosphorus (P)',
    unit: 'kg/ha',
    low: 10,
    high: 25,
    deficientAdvice: 'Add single super phosphate to boost phosphorus.',
    excessiveAdvice: 'Phosphorus is high — no more phosphorus fertiliser needed for now.',
  },
  {
    key: 'potassium',
    label: 'Potassium (K)',
    unit: 'kg/ha',
    low: 108,
    high: 280,
    deficientAdvice: 'Add muriate of potash to boost potassium.',
    excessiveAdvice: 'Potassium is high — no more potash needed for now.',
  },
  {
    key: 'sulphur',
    label: 'Sulphur (S)',
    unit: 'ppm',
    low: 10,
    high: 30,
    deficientAdvice: 'Add elemental sulphur or gypsum.',
    excessiveAdvice: 'Sulphur is high — no action needed.',
  },
  {
    key: 'zinc',
    label: 'Zinc (Zn)',
    unit: 'ppm',
    low: 0.6,
    high: 3,
    deficientAdvice: 'Add zinc sulphate to address the shortfall.',
    excessiveAdvice: 'Zinc is high — no action needed.',
  },
  {
    key: 'boron',
    label: 'Boron (B)',
    unit: 'ppm',
    low: 0.5,
    high: 2,
    deficientAdvice: 'Add a small amount of boric acid.',
    excessiveAdvice: 'Boron is high — avoid boron-based fertiliser this season.',
  },
  {
    key: 'iron',
    label: 'Iron (Fe)',
    unit: 'ppm',
    low: 4.5,
    high: 15,
    deficientAdvice: 'A ferrous sulphate spray can help address the shortfall.',
    excessiveAdvice: 'Iron is high — no action needed.',
  },
  {
    key: 'manganese',
    label: 'Manganese (Mn)',
    unit: 'ppm',
    low: 2,
    high: 10,
    deficientAdvice: 'A manganese sulphate spray can help address the shortfall.',
    excessiveAdvice: 'Manganese is high — no action needed.',
  },
  {
    key: 'copper',
    label: 'Copper (Cu)',
    unit: 'ppm',
    low: 0.2,
    high: 5,
    deficientAdvice: 'A copper sulphate spray can help address the shortfall.',
    excessiveAdvice: 'Copper is high — no action needed.',
  },
];

function classify(value: number, config: NutrientConfig): NutrientStatusEntry {
  if (config.isPH) {
    if (value < config.low) return { value, status: 'Acidic', recommendation: config.deficientAdvice };
    if (value > config.high) return { value, status: 'Alkaline', recommendation: config.excessiveAdvice };
    return { value, status: 'Neutral', recommendation: 'In a healthy range — no action needed.' };
  }
  if (value < config.low) return { value, status: 'Deficient', recommendation: config.deficientAdvice };
  if (value > config.high) return { value, status: 'Excessive', recommendation: config.excessiveAdvice };
  return { value, status: 'Sufficient', recommendation: 'In a healthy range — no action needed.' };
}

const ADVISORIES: Record<AdvisoryLanguage, Record<'Poor' | 'Moderate' | 'Good', string>> = {
  English: {
    Poor: 'Your soil needs attention soon. Add urea for nitrogen, single super phosphate for phosphorus, and muriate of potash for potassium. A zinc sulphate and boric acid application will help too. Check your soil again after this crop cycle.',
    Moderate:
      'Your soil is in okay shape, but nitrogen and sulphur are a little low. A basal dose of urea and elemental sulphur will help. Keep adding crop residue to build up organic matter, and check again next season.',
    Good: 'Your soil is healthy. Keep doing what you’re doing, and check again each season to stay ahead of any changes.',
  },
  Hindi: {
    Poor: 'मिट्टी का स्वास्थ्य गंभीर रूप से कमजोर है। नाइट्रोजन के लिए यूरिया, फॉस्फोरस के लिए सिंगल सुपर फॉस्फेट, और पोटेशियम के लिए म्यूरेट ऑफ पोटाश डालें। जिंक सल्फेट और बोरिक एसिड से सूक्ष्म पोषण की कमी भी दूर होगी।',
    Moderate:
      'मिट्टी का स्वास्थ्य सामान्य है। नाइट्रोजन और सल्फर पर ध्यान दें। यूरिया और एलिमेंटल सल्फर की आधार खुराक दें। फसल अवशेष मिलाकर जैविक पदार्थ बनाए रखें।',
    Good: 'मिट्टी स्वस्थ है। वर्तमान उर्वरक प्रथाएं जारी रखें और हर मौसम पुनः जांच करें।',
  },
  Telugu: {
    Poor: 'నేల ఆరోగ్యం త్వరగా దృష్టి పెట్టాలి. నత్రజని కోసం యూరియా, భాస్వరం కోసం సింగల్ సూపర్ ఫాస్ఫేట్, పొటాషియం కోసం మ్యూరేట్ ఆఫ్ పొటాష్ వేయండి.',
    Moderate:
      'నేల ఆరోగ్యం మధ్యస్థంగా ఉంది. నత్రజని మరియు గంధకంపై దృష్టి పెట్టండి. పంట అవశేషాలు కలపేసి సేంద్రీయ పదార్థాన్ని కొనసాగించండి.',
    Good: 'నేల ఆరోగ్యకరంగా ఉంది. ప్రస్తుత పద్ధతులను కొనసాగించండి, ప్రథి సీజన్ మళ్లీ తనిఖీ చేయండి.',
  },
};

export function mockSoilAdvisory(request: SoilAdvisoryRequest): SoilAdvisoryResponse {
  const statuses: Record<string, NutrientStatusEntry> = {};
  let problemCount = 0;

  for (const config of NUTRIENT_CONFIG) {
    const rawValue = request[config.key];
    const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    const entry = classify(value, config);
    statuses[config.key] = entry;
    if (entry.status !== 'Sufficient' && entry.status !== 'Neutral') problemCount += 1;
  }

  const overallLabel: 'Poor' | 'Moderate' | 'Good' =
    problemCount >= 6 ? 'Poor' : problemCount >= 3 ? 'Moderate' : 'Good';
  const confidence = overallLabel === 'Good' ? 0.94 : overallLabel === 'Moderate' ? 0.88 : 0.91;

  const remainder = (1 - confidence) / 2;
  const classProbabilities: Record<string, number> = { Poor: remainder, Moderate: remainder, Good: remainder };
  classProbabilities[overallLabel] = confidence;

  return {
    layer1: {
      nutrient_statuses: statuses,
      overall_label: overallLabel,
      problem_count: problemCount,
    },
    layer2: {
      prediction: overallLabel,
      confidence,
      class_probabilities: classProbabilities,
    },
    layer3: request.generate_llm === false
      ? null
      : {
          advisories: {
            English: ADVISORIES.English[overallLabel],
            Hindi: ADVISORIES.Hindi[overallLabel],
            Telugu: ADVISORIES.Telugu[overallLabel],
          },
        },
    inference_time_ms: 2100,
  };
}
