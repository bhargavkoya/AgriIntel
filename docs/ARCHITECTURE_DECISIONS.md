FastAPI instead of Flask.

Clean Architecture (routes → services → repositories → artifacts).

Notebooks are training only and are never imported.

All models load once at application startup.

Only artifacts (.keras, .pkl, JSON configs) are consumed in production.

No business logic inside API routes.

All modules expose REST endpoints with consistent request/response schemas.

Use dependency injection, environment variables, structured logging, and versioned model artifacts.

## LLM Provider Abstraction

Module C notebook uses Groq (`llama-3.1-8b-instant`). Production abstracts LLM behind `LLMProvider` protocol:

- `GroqProvider` — default implementation, notebook-faithful
- `GeminiProvider` — future stub for provider swap without service changes

`AdvisorService` depends on the protocol, not a specific provider. Translation uses `deep-translator` as in the notebook.

## Notebook vs Spec Deviations

Notebooks are the source of truth. Where PROJECT_SPECIFICATIONS.MD differs:

| Topic | Spec | Notebook (wins) | Resolution |
|-------|------|-----------------|------------|
| LLM provider | Google Gemini | Groq | Abstract interface; Groq first |
| Disease model file | `resnet50.keras` | `resnet.keras` | Use notebook filename |
| Yield pipelines | `rf_pipeline.pkl` | `preprocessor_full.pkl` + `models/rf_full.pkl` | Separate preprocessor and model files |
| Advisor pipeline | `soil_pipeline.pkl` | `rf_model.pkl` + `rules.json` + encoders | Multi-file artifact bundle |
| Year field | `Year` | `Crop_Year` | API accepts `year`, maps internally |
| Module C input | Soil card digitization (OCR) | Tabular CSV only | API accepts structured parameters; no OCR |
| Module A epochs | 15 + 10 (markdown) | 10 + 5 (code) | Code values used at export |

## Inference Code Location

- `training/inference/` — extracted notebook inference modules (Phase 2)
- `backend/app/ml/` — thin wrappers for DI and testing
- Backend never imports `.ipynb` files

## Artifact Management

- Artifacts gitignored (large binaries)
- Manual upload per module README
- Paths configurable via `ARTIFACTS_*_PATH` env vars
- Fail-fast at startup if required files missing (Phase 3+)

## Database

SQLite default with SQLAlchemy repository pattern. PostgreSQL via `DATABASE_URL` without code changes.
