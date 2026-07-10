# Module B — Yield Prediction Artifacts

Upload exported artifacts from `training/ModuleB_CropYieldPrediction_Thesis_Implementation_BhargavaKoya_20075511.ipynb` into this directory.

## Required Files (Inference)

| File | Format | Purpose |
|------|--------|---------|
| `preprocessor_full.pkl` | joblib | Full-feature sklearn ColumnTransformer pipeline |
| `preprocessor_min.pkl` | joblib | Minimal-feature sklearn ColumnTransformer pipeline |
| `feature_config.json` | JSON | Feature lists, target column, log1p/expm1 contract |
| `best_model.json` | JSON | Production model selection (default: XGBoost full) |
| `models/xgb_full.pkl` | joblib | XGBoost regressor (full features) — production default |
| `models/xgb_min.pkl` | joblib | XGBoost regressor (minimal features) |
| `models/rf_full.pkl` | joblib | Random Forest regressor (full features) |
| `models/rf_min.pkl` | joblib | Random Forest regressor (minimal features) |
| `models/gb_full.pkl` | joblib | HistGradientBoosting regressor (full features) |
| `models/gb_min.pkl` | joblib | HistGradientBoosting regressor (minimal features) |

## Optional Files (Evaluation / UI)

| File | Format | Purpose |
|------|--------|---------|
| `best_params.json` | JSON | Grid-search hyperparameters (retraining reference) |
| `test_metrics.csv` | CSV | All 6 model test results |
| `shap_feature_importance.csv` | CSV | Precomputed SHAP feature importances |
| `ablation_results.csv` | CSV | Full vs minimal feature comparison |
| `manifest.json` | JSON | File inventory and metadata |
| `cleaned_dataset.csv` | CSV | Post-cleaning dataset |
| `train_split.csv`, `val_split.csv`, `test_split.csv` | CSV | Data splits |

## Inference Contract

1. Compute derived fields: `Fertilizer_per_ha = Fertilizer / Area`, `Pesticide_per_ha = Pesticide / Area`
2. Apply fitted preprocessor (`transform` only — never `fit`)
3. Predict in log space (`log1p` target was used during training)
4. Inverse transform: `expm1(prediction)` then `clip(min=0)`

## Feature Sets

**Full numeric:** `Annual_Rainfall`, `Area`, `Fertilizer_per_ha`, `Pesticide_per_ha`, `Crop_Year`

**Minimal numeric:** `Annual_Rainfall`, `Area`

**Categorical:** `State`, `Crop`, `Season`

## Upload Instructions

1. Run the Module B notebook in Colab and execute the artifact export cells.
2. Download `yield_artifacts.zip` (or copy the `artifacts/yield/` folder).
3. Extract all files into this directory, preserving the `models/` subdirectory.
4. Verify preprocessor files, `feature_config.json`, `best_model.json`, and all 6 model files are present.
