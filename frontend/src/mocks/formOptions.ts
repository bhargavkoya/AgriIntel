/**
 * Every list below is sourced directly from the real training artifacts, not hand-picked —
 * the two ML modules were trained on different datasets with different category coverage,
 * so state/crop lists are intentionally per-module rather than one shared "all India" list.
 */

// artifacts/advisor/label_encoders.pkl ("le_state" classes) — Soil module only.
// Selecting anything outside this exact list 400s (LabelEncoder rejects unseen labels).
export const SOIL_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// artifacts/advisor/label_encoders.pkl ("le_soil" classes) — Soil module only.
export const SOIL_TYPES = ['Alluvial', 'Black', 'Desert', 'Laterite', 'Mountain', 'Red'];

// artifacts/yield/cleaned_dataset.csv ("State" column) — Yield module only.
// A different real list from SOIL_STATES (e.g. includes Puducherry, excludes Rajasthan) —
// that's the actual training data, not a typo. The yield model tolerates unseen states
// gracefully (OneHotEncoder handle_unknown='ignore') but predictions are most accurate
// for states it was actually trained on.
export const YIELD_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// artifacts/yield/cleaned_dataset.csv ("Season" column) — Yield module only.
export const SEASONS = ['Autumn', 'Kharif', 'Rabi', 'Summer', 'Whole Year', 'Winter'];

// artifacts/yield/cleaned_dataset.csv ("Crop" column) — Yield module only.
// Crop is a free-text field (new crops can show up over time), this list only backs the
// <datalist> autocomplete suggestions; typing anything else is still accepted and handled
// gracefully by the same OneHotEncoder(handle_unknown='ignore').
export const YIELD_CROPS = [
  'Arecanut',
  'Arhar/Tur',
  'Bajra',
  'Banana',
  'Barley',
  'Black pepper',
  'Cardamom',
  'Cashewnut',
  'Castor seed',
  'Coconut',
  'Coriander',
  'Cotton(lint)',
  'Cowpea(Lobia)',
  'Dry chillies',
  'Garlic',
  'Ginger',
  'Gram',
  'Groundnut',
  'Guar seed',
  'Horse-gram',
  'Jowar',
  'Jute',
  'Khesari',
  'Linseed',
  'Maize',
  'Masoor',
  'Mesta',
  'Moong(Green Gram)',
  'Moth',
  'Niger seed',
  'Oilseeds total',
  'Onion',
  'Other  Rabi pulses',
  'Other Cereals',
  'Other Kharif pulses',
  'Other Summer Pulses',
  'Peas & beans (Pulses)',
  'Potato',
  'Ragi',
  'Rapeseed &Mustard',
  'Rice',
  'Safflower',
  'Sannhamp',
  'Sesamum',
  'Small millets',
  'Soyabean',
  'Sugarcane',
  'Sunflower',
  'Sweet potato',
  'Tapioca',
  'Tobacco',
  'Turmeric',
  'Urad',
  'Wheat',
  'other oilseeds',
];
