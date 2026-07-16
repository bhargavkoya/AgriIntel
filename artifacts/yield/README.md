# Module B — Yield Prediction Artifacts

Upload exported artifacts from `training/ModuleB_CropYieldPrediction_Thesis_Implementation_BhargavaKoya_20075511.ipynb` into this directory.

## Required Files (Inference)

| File | Format | Purpose |
|------|--------|---------|
| `preprocessor_full.pkl` | joblib | Full-feature sklearn ColumnTransformer pipeline |
| `preprocessor_min.pkl` | joblib | Minimal-feature sklearn ColumnTransformer pipeline |
| `feature_config.json` | JSON | Feature lists, target column, log1p/expm1 contract |
| `best_model.json` | JSON | Production model selection (default: XGBoost full) |
| `models/xgb_full.json` | XGBoost native | XGBoost regressor (full features) — production default |
| `models/xgb_min.json` | XGBoost native | XGBoost regressor (minimal features) |
| `models/rf_full.pkl` | joblib | Random Forest regressor (full features) |
| `models/rf_min.pkl` | joblib | Random Forest regressor (minimal features) |
| `models/gb_full.pkl` | joblib | HistGradientBoosting regressor (full features) |
| `models/gb_min.pkl` | joblib | HistGradientBoosting regressor (minimal features) |

**Important — `xgb_full`/`xgb_min` must be exported with XGBoost's native `save_model()`, not `joblib.dump()`.** A pickled `Booster` is only reliably readable by the *exact* xgboost version that wrote it; loading it with a different version can silently degrade predictions (no error, just wrong numbers) instead of failing loudly. In the notebook, replace the joblib/pickle export for these two models with:

```python
xgb_full_model.save_model("xgb_full.json")   # instead of joblib.dump(xgb_full_model, "xgb_full.pkl")
xgb_min_model.save_model("xgb_min.json")     # instead of joblib.dump(xgb_min_model, "xgb_min.pkl")
```

Then upload `xgb_full.json`/`xgb_min.json` into `models/` (the old `.pkl` versions of these two, if present, are no longer read and can be deleted). `rf_*`/`gb_*` stay as plain `joblib.dump()` `.pkl` files — they're ordinary scikit-learn estimators and don't have this cross-version fragility.

**Also check the installed `xgboost` version on the backend matches (or is newer than) whatever Colab wrote these files with.** The native format is portable, but an *older* reader loading a *newer* writer's file can silently mis-apply newer fields (e.g. the `boost_from_average`/auto-computed `base_score` XGBoost added in later versions) instead of erroring — this produced systematically underpredicted yields with a clean, error-free load. Check the file's own version: `python -c "import json; print(json.load(open('models/xgb_full.json'))['version'])"`, and keep `backend/requirements.txt`'s `xgboost` pin at or above it.

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
