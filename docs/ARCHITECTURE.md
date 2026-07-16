# AgriIntel System Architecture

## Overview

AgriIntel is a production-ready AI web application for agricultural decision support. It integrates three independent AI modules into a unified platform:

| Module | Name | Technology |
|--------|------|------------|
| A | Crop Disease Detection | TensorFlow CNN (4 architectures) |
| B | Crop Yield Prediction | Scikit-learn ensemble (RF, XGBoost, HGB) |
| C | Soil Health Advisor | Rule engine + RF + LLM + translation |

Training notebooks under `training/` are the **sole source of truth** for all ML logic. The backend consumes exported artifacts only and never executes training code.

## Design Principles

1. Training is completely separated from production
2. Backend only consumes exported artifacts
3. Every module is an independent service
4. No business logic inside API routes
5. No duplicated preprocessing
6. All models load once at application startup
7. All configuration comes from environment variables
8. Modular and extensible for future AI modules

## Repository Structure

```
AgriIntel/
├── artifacts/              # Exported model artifacts (gitignored binaries)
│   ├── disease/
│   ├── yield/
│   └── advisor/
├── training/               # Immutable research notebooks
│   └── inference/          # Phase 2: extracted inference modules
├── backend/app/            # FastAPI application
├── frontend/src/           # React 19 + Tailwind v4 + shadcn/ui application
│   ├── pages/               # One component per route (Home, Disease, Yield, Soil, History, HistoryDetail)
│   ├── services/            # Thin per-module axios wrappers — the only layer allowed to call the API
│   ├── types/                # TS interfaces mirroring docs/API_CONTRACTS.md exactly
│   ├── mocks/                # Static presentation config only (labels, dropdown options) — no fake data
│   ├── components/          # Shared UI (shadcn primitives, illustrations, layout chrome)
│   └── lib/                  # Small pure helpers (error parsing, relative time, count-up animation)
├── docs/                   # Architecture and API documentation
└── data/                   # SQLite DB and uploaded files
```

## Clean Architecture Layers

```
Frontend (React)
  pages/*.tsx  →  services/*.ts (axios)
    ↓ REST API
API Layer (FastAPI routes + Pydantic schemas)
    ↓
Service Layer (DiseaseService, YieldService, AdvisorService)
    ↓
ML Inference Layer (training/inference/ modules)
    ↓
Artifacts (on-disk .keras, .pkl, JSON)
```

Data persistence flows through repositories (SQLite, PostgreSQL-ready). See
[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) for the full frontend-to-artifact diagram,
including per-page frontend workflows.

## Frontend Architecture (Phase 4/5 — implemented)

The frontend never contains AI logic (hard rule, see below) — it only renders forms, calls the
REST API, and presents results.

- **Routing**: `App.tsx` → `MainLayout` (header/footer/toast host) wraps 7 routes: `/` (Home),
  `/disease`, `/yield`, `/soil`, `/history`, `/history/:id`, and a catch-all 404.
- **Services layer** (`services/*.ts`): one file per module (`disease.ts`, `yield.ts`, `soil.ts`,
  `history.ts`), each a thin wrapper around a shared axios instance (`services/api.ts`, base URL
  `/api` via the Vite dev proxy to `:8000`, overridable with `VITE_API_BASE_URL` for non-proxied
  deployments). Pages never call axios directly.
- **Types layer** (`types/*.ts`): hand-written interfaces kept in exact sync with
  [API_CONTRACTS.md](API_CONTRACTS.md), so request/response shapes are type-checked end to end.
- **Error handling**: every service call from a page is wrapped in try/catch; failures surface
  via a shadcn `sonner` toast (`lib/apiError.ts` extracts the backend's real `detail` message)
  while preserving form state so the user can retry without re-entering data.
- **Presentation config** (`mocks/*.ts` — legacy naming from the Phase 4 mocked build, now holds
  no fake data): per-module labels (e.g. model display names), dropdown option lists sourced
  directly from each ML module's real training artifacts (not hand-picked — the Disease/Soil and
  Yield modules were trained on different data with different valid categories), and nutrient
  display config for the Soil page.
- **History**: server-side module filtering (`?module=`) and "Load more" pagination against the
  real paginated `GET /api/history` endpoint; detail view fetches a single record via
  `GET /api/history/{id}`.

### Layer Responsibilities

| Layer | Responsibility | Must NOT |
|-------|---------------|----------|
| **Routes** | Validate input, call service, return HTTP response | Contain business or ML logic |
| **Schemas** | Request/response DTOs with Pydantic validation | Access database or artifacts |
| **Services** | Orchestrate inference, persist history, handle errors | Implement preprocessing directly |
| **ML Layer** | Pure inference functions from notebook extraction | Make HTTP calls or DB queries |
| **Repositories** | CRUD for prediction history and uploaded files | Contain ML logic |
| **Integrations** | External APIs (LLM providers) | Know about HTTP routing |

## Module Data Flows

### Module A — Disease Detection

```
Image Upload → preprocess_image(mode) → model.predict() → class + confidence → verdict
```

Four CNN models with model-specific preprocessing modes (`rescale`, `none`, `resnet`, `vgg`).

### Module B — Yield Prediction

```
Tabular Input → derive per_ha fields → preprocessor.transform() → model.predict(log) → expm1 + clip → yield
```

Six model variants (3 algorithms × 2 feature sets). Default: XGBoost full.

### Module C — Soil Health Advisor

```
Soil Parameters → Layer 1 Rules → Layer 2 RF → Layer 3 LLM → Translation → multilingual advice
```

Three-layer pipeline. LLM is optional (`generate_llm` flag).

## Startup Sequence

1. Load environment configuration from `.env`
2. Initialize structured logging
3. Verify artifact directories exist
4. Load all models and configs into memory (Phase 3+)
5. Initialize database connection
6. Register API routes
7. Serve requests

The `/api/health` endpoint reports application and artifact load status.

## Artifact Loading (Phase 3+)

| Service | Artifacts Loaded at Startup |
|---------|----------------------------|
| DiseaseService | 4 `.keras` models, `class_names.json`, `image_config.json`, `metrics.json` |
| YieldService | 2 preprocessors, 6 models, `feature_config.json`, `best_model.json` |
| AdvisorService | `rules.json`, `rf_model.pkl`, `label_encoders.pkl`, `feature_config.json`, `prompt_template.txt`, `language_codes.json` |
| LLMProvider | Groq client from `GROQ_API_KEY` |

Fail-fast if required artifacts are missing.

## Database Design

SQLite by default, swappable to PostgreSQL via `DATABASE_URL`.

| Table | Purpose |
|-------|---------|
| PredictionHistory | Stores request/response JSON, module, model, latency |
| UploadedFiles | Tracks uploaded images and files |

## LLM Abstraction

Module C uses an `LLMProvider` protocol:

- **GroqProvider** — default, notebook-faithful (`llama-3.1-8b-instant`)
- **GeminiProvider** — future stub for provider swap

`AdvisorService` depends on the protocol, not a specific provider.

## Deployment

Docker Compose with backend (Uvicorn) and frontend (Vite build served by nginx or dev proxy). Health checks on `/api/health`. Not yet started — see [ROADMAP.md](../ROADMAP.md) Phase 8 for the detailed deployment plan (this comes after model-serving reliability and offline/low-connectivity work, not immediately next).

## Development Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Architecture, scaffolding, documentation | Done |
| 2 | Notebook inference extraction | Done |
| 3 | Backend services and API | Done — real inference, persistence, real Groq LLM, verified against real artifacts end-to-end |
| 4 | React frontend pages (Tailwind v4 + shadcn/ui) | Done |
| 5 | End-to-end integration (real API wiring + post-usage fixes) | Done |

Everything past Phase 5 is tracked in [ROADMAP.md](../ROADMAP.md), which breaks the remaining work into finer-grained phases (model-serving reliability, offline handling, deployment, real-user testing, hardening) than this table does.

## Related Documentation

- [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) — ASCII diagrams + per-page/per-endpoint request workflows (frontend and backend)
- [ARCHITECTURAL_CONSTRAINTS.md](ARCHITECTURAL_CONSTRAINTS.md) — hard rules
- [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) — decision log
- [ARTIFACT_CONTRACTS.md](ARTIFACT_CONTRACTS.md) — per-file artifact schemas
- [API_CONTRACTS.md](API_CONTRACTS.md) — REST endpoint specifications
- [NOTEBOOK_INTEGRATION.md](NOTEBOOK_INTEGRATION.md) — notebook extraction rules
- [ROADMAP.md](../ROADMAP.md) — phase-by-phase plan from here to a shipped product
