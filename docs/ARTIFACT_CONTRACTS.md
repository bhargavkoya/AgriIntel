# Artifact Contracts

This document defines the exact artifact files exported by each training notebook. The backend must load these files as-is — never recreate their contents in code.

Source notebooks:

- Module A: `training/ModeuleA_CropDiseaseDetection_Thesis_Implementation_BhargavaKoya_20075511.ipynb`
- Module B: `training/ModuleB_CropYieldPrediction_Thesis_Implementation_BhargavaKoya_20075511.ipynb`
- Module C: `training/ModuleC_SoilHealthCardDigitization_Thesis_Implementation_BhargavaKoya_20075511.ipynb`

---

## Module A — `artifacts/disease/`

### `class_names.json`

Index-to-label mapping. Keys are stringified integers.

```json
{
  "0": "Apple Scab",
  "1": "Black Rot",
  "2": "Cedar Apple Rust",
  "3": "Healthy"
}
```

Class order is alphabetical by training directory name. Always load from this file — never assume order.

### `image_config.json`

Keyed by saved model filename. Each entry defines the preprocessing contract.

```json
{
  "custom.keras": {
    "height": 150,
    "width": 150,
    "preprocess_mode": "rescale"
  },
  "efficientnet.keras": {
    "height": 224,
    "width": 224,
    "preprocess_mode": "none"
  },
  "resnet.keras": {
    "height": 224,
    "width": 224,
    "preprocess_mode": "resnet"
  },
  "vgg16.keras": {
    "height": 224,
    "width": 224,
    "preprocess_mode": "vgg"
  }
}
```

### `metrics.json`

```json
{
  "active_model": "EfficientNetB0",
  "benchmark": [
    {
      "Model": "EfficientNetB0",
      "Test_Accuracy": 0.95,
      "Test_Loss": 0.12
    }
  ]
}
```

Exact field names and values depend on notebook output. `active_model` selects the default inference model.

### Model Files

| File | Architecture | Input Size |
|------|-------------|------------|
| `custom.keras` | Custom 4-block CNN | 150×150×3 |
| `efficientnet.keras` | EfficientNetB0 + custom head | 224×224×3 |
| `resnet.keras` | ResNet50 + custom head | 224×224×3 |
| `vgg16.keras` | VGG16 + custom head | 224×224×3 |

### Inference Constants

| Constant | Value |
|----------|-------|
| `HEALTHY_LABEL` | `"Healthy"` |
| `CONFIDENCE_THRESHOLD` | `0.60` (low-confidence warning only) |
| Number of classes | 4 |

---

## Module B — `artifacts/yield/`

### `feature_config.json`

```json
{
  "numeric_features_full": [
    "Annual_Rainfall",
    "Area",
    "Fertilizer_per_ha",
    "Pesticide_per_ha",
    "Crop_Year"
  ],
  "numeric_features_min": [
    "Annual_Rainfall",
    "Area"
  ],
  "categorical_features": [
    "State",
    "Crop",
    "Season"
  ],
  "target": "Yield",
  "target_transform": "log1p",
  "inverse_transform": "expm1"
}
```

### `best_model.json`

```json
{
  "best_full_model": "XGBoost        (full)",
  "r2": 0.9137
}
```

The backend maps `best_full_model` to `models/xgb_full.json` + `preprocessor_full.pkl`.

### Preprocessor Files

| File | Feature Set | Pipeline |
|------|------------|----------|
| `preprocessor_full.pkl` | Full (5 numeric + 3 categorical) | KNNImputer(5) → StandardScaler + OneHotEncoder |
| `preprocessor_min.pkl` | Minimal (2 numeric + 3 categorical) | Same pipeline, fewer numeric columns |

### Model Files — `models/`

| File | Algorithm | Feature Set |
|------|-----------|-------------|
| `xgb_full.json` | XGBRegressor | Full |
| `xgb_min.json` | XGBRegressor | Minimal |
| `rf_full.pkl` | RandomForestRegressor | Full |
| `rf_min.pkl` | RandomForestRegressor | Minimal |
| `gb_full.pkl` | HistGradientBoostingRegressor | Full |
| `gb_min.pkl` | HistGradientBoostingRegressor | Minimal |

**Note on `xgb_full`/`xgb_min` format**: these must be exported via XGBoost's native `model.save_model("xgb_full.json")`, **not** `joblib.dump()`/pickle. XGBoost's `Booster` uses its own internal binary format that pickle captures byte-for-byte for the *exact* xgboost version that wrote it — loading that pickle with a different xgboost version can silently degrade prediction quality (confirmed: R² dropped from a documented 0.91 to 0.74 on real held-out data after a version-mismatched pickle load, with no error raised). The native `save_model()`/`load_model()` JSON/UBJSON format is version-portable *between compatible reader/writer versions*, but is not entirely immune to version drift either — confirmed: loading a Colab-written `xgb_full.json` (`"version": [3, 3, 0]`, using the newer `boost_from_average` auto-computed `base_score`) with an older installed `xgboost==2.1.4` reader silently mis-applied that base score and produced systematically underpredicted yields, again with no error raised. **The backend's installed `xgboost` version must be at or above the version that wrote the artifact JSON** (check the file's own `"version"` field) — `backend/requirements.txt` is currently pinned to `xgboost==3.3.0` to match. `rf_*`/`gb_*` are plain scikit-learn estimators and don't have either of these issues — `joblib.dump()`/`pickle` is fine for those (just keep the pickling scikit-learn version reasonably close to the loading one).

### Inference Contract

1. Input must include raw `Fertilizer` and `Area` (backend computes `Fertilizer_per_ha`, `Pesticide_per_ha`)
2. `preprocessor.transform()` — never `fit` or `fit_transform`
3. `model.predict(X)` returns log-space prediction
4. `np.clip(np.expm1(prediction), 0, None)` → yield in tonnes/ha

---

## Module C — `artifacts/advisor/`

### `rules.json`

Contains ICAR-based thresholds and recommendations.

```json
{
  "THRESHOLDS": {
    "ph": {"low": 6.5, "high": 7.5},
    "organic_carbon": {"low": 0.50, "high": 0.75},
    "nitrogen": {"low": 280, "high": 560}
  },
  "RECOMMENDATIONS": {
    "ph": {
      "Acidic": "Apply agricultural lime...",
      "Alkaline": "Apply gypsum..."
    }
  },
  "UNITS": {
    "ph": "pH units",
    "organic_carbon": "%"
  },
  "NUTRIENT_LABELS": {},
  "NUTRIENT_COLS": []
}
```

Exact structure matches notebook export. All threshold logic must be loaded from this file.

### `feature_config.json`

```json
{
  "feature_cols": [
    "ph", "organic_carbon", "nitrogen", "phosphorus", "potassium",
    "sulphur", "zinc", "boron", "iron", "manganese", "copper",
    "soil_type_enc", "state_enc"
  ],
  "target_col": "label_encoded",
  "label_names": ["Poor", "Moderate", "Good"],
  "label_map": {"Poor": 0, "Moderate": 1, "Good": 2}
}
```

Feature order is strict. The last two columns are LabelEncoder outputs.

### `label_encoders.pkl`

Joblib dict with two fitted encoders:

```python
{
  "le_soil": LabelEncoder(),  # fitted on soil_type values
  "le_state": LabelEncoder()  # fitted on state values
}
```

No `handle_unknown` — unseen categories will raise an error.

### `language_codes.json`

```json
{
  "English": "en",
  "Hindi": "hi",
  "Telugu": "te"
}
```

### `prompt_template.txt`

Plain text file containing the system prompt and prompt-building instructions used by Layer 3. Loaded at startup and passed to the LLM provider.

### `rf_model.pkl`

Fitted `RandomForestClassifier`:

```python
RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42,
    class_weight="balanced"
)
```

### Layer 1 Label Derivation

| Problem Count | Overall Label |
|---------------|---------------|
| ≥ 6 | Poor |
| 3 – 5 | Moderate |
| 0 – 2 | Good |

Problems = nutrients with status Deficient, Excessive, Acidic, or Alkaline.

### LLM Runtime Parameters (Not Artifacts)

| Parameter | Value | Source |
|-----------|-------|--------|
| Provider | Groq (default) | `.env` |
| Model | `llama-3.1-8b-instant` | `GROQ_MODEL` |
| Temperature | 0.3 | `GROQ_TEMPERATURE` |
| Max tokens | 400 | `GROQ_MAX_TOKENS` |

---

## Cross-Module Notes

- Artifact paths are configurable via environment variables (`ARTIFACTS_*_PATH`)
- Large binary files are gitignored; upload manually per module README
- `manifest.json` (where present) provides file inventory for validation at startup
- Spec document names may differ from notebook exports — always use notebook filenames
