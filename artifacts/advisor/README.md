# Module C — Soil Health Advisor Artifacts

Upload exported artifacts from `training/ModuleC_SoilHealthCardDigitization_Thesis_Implementation_BhargavaKoya_20075511.ipynb` into this directory.

## Required Files (Inference)

| File | Format | Purpose |
|------|--------|---------|
| `rules.json` | JSON | ICAR nutrient thresholds, recommendations, units |
| `rf_model.pkl` | joblib | Layer 2 Random Forest classifier |
| `label_encoders.pkl` | joblib | Fitted LabelEncoders for `soil_type` and `state` |
| `feature_config.json` | JSON | Feature column order, label map, target column |
| `prompt_template.txt` | text | LLM system prompt and prompt-building contract |
| `language_codes.json` | JSON | Language name → ISO code mapping |

## Optional Files (Evaluation / Thesis)

| File | Format | Purpose |
|------|--------|---------|
| `layer2_metrics.json` | JSON | RF accuracy, F1, top features |
| `layer1_enriched.csv` | CSV | Full Layer 1 rule engine output |
| `pipeline_output.csv` | CSV | Full 3-layer pipeline output |
| `sample_advisories.json` | JSON | Example LLM outputs |
| `noise_robustness_results.csv` | CSV | Layer 2 defense experiment |
| `boundary_case_results.csv` | CSV | Threshold boundary analysis |
| `layer2_defense_summary.json` | JSON | Thesis defense metrics |
| `manifest.json` | JSON | File inventory and metadata |

## Layer 2 Feature Order (Strict)

```
ph, organic_carbon, nitrogen, phosphorus, potassium,
sulphur, zinc, boron, iron, manganese, copper,
soil_type_enc, state_enc
```

## Label Mapping

| Index | Label |
|-------|-------|
| 0 | Poor |
| 1 | Moderate |
| 2 | Good |

## LLM Configuration (Runtime — Not Exported)

Layer 3 requires a live API key at runtime:

- Provider: Groq (default implementation)
- Model: `llama-3.1-8b-instant`
- Temperature: 0.3
- Max tokens: 400
- Translation: `deep-translator` (Hindi, Telugu)

Set `GROQ_API_KEY` in `.env` before using the advisor endpoint with `generate_llm: true`.

## Upload Instructions

1. Run the Module C notebook in Colab and execute the artifact export cells.
2. Download `advisor_artifacts.zip` (or copy the `artifacts/advisor/` folder).
3. Extract all files into this directory.
4. Verify all 6 required files are present before starting the backend.
