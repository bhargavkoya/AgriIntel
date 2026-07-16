# AgriIntel — Architecture Diagram & Layer-by-Layer Workflows

ASCII reference for the actual, currently-implemented system (post Phase 5.1 — real API
integration plus the round of fixes found from real usage). For narrative design principles see
[ARCHITECTURE.md](ARCHITECTURE.md); this document is the visual/workflow companion, and now
covers the frontend's internal structure and per-page workflows in addition to the backend.

---

## 1. System-Level Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Browser (React 19 SPA) — frontend/src/*                   │
│                                                                                │
│  App.tsx → MainLayout (header, footer, <Toaster/> toast host)                 │
│    └─▶ pages/*.tsx : HomePage, DiseasePage, YieldPage, SoilPage,               │
│                        HistoryPage, HistoryDetailPage, NotFoundPage            │
│              │ calls (never axios directly)                                    │
│              ▼                                                                 │
│  services/*.ts : disease.ts  yield.ts  soil.ts  history.ts                     │
│    └─▶ services/api.ts — single axios instance                                 │
│         baseURL: VITE_API_BASE_URL || '/api'                                   │
│              │ on 4xx/5xx / network failure                                     │
│              ▼                                                                 │
│  lib/apiError.ts → getErrorMessage() → toast.error() (sonner)                  │
│         form values / uploaded photo preserved so the user can retry           │
└──────────────────────────────┬─────────────────────────────────────────────────┘
                                │ REST/JSON (axios) — multipart for disease upload
                                │ http://localhost:5173 → :8000  (vite dev proxy, /api/*)
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          FastAPI app (backend/app/main.py)                    │
│                                                                                │
│  ┌───────────────────── Global Exception Handlers ────────────────────────┐  │
│  │ backend/app/api/errors.py — registered before routes                    │  │
│  │  HTTPException → {detail, error_code}                                   │  │
│  │  RequestValidationError → {detail, error_code: "VALIDATION_ERROR"}      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌──────────────────────────── API Layer ─────────────────────────────────┐  │
│  │ backend/app/api/routes/*.py            backend/app/schemas/api.py       │  │
│  │  health.py   disease.py   yield_prediction.py   advisor.py  history.py  │  │
│  │  - validates request via Pydantic schema                                │  │
│  │  - raises 503 (not loaded) / 400 (bad input) / 404 (not found) /        │  │
│  │    422 (validation) — the handler above shapes the JSON body            │  │
│  │  - NO business logic here                                               │  │
│  └───────────────────────────────┬──────────────────────────────────────────┘  │
│                                  │ Depends(get_*_service)  [backend/app/api/deps.py]
│                                  ▼                                            │
│  ┌───────────────────────────── Service Layer ─────────────────────────────┐  │
│  │ backend/app/services/*.py                                                │  │
│  │  DiseaseService   YieldService   AdvisorService                          │  │
│  │  - orchestrates inference, maps request/response shapes                  │  │
│  │  - persists history (best-effort) via history_helper.py                  │  │
│  └───────┬───────────────────────┬───────────────────────┬─────────────────┘  │
│          │                       │                       │                    │
│          ▼                       ▼                       ▼                    │
│  ┌───────────────┐      ┌────────────────┐      ┌─────────────────────────┐  │
│  │ app/ml/disease│      │ app/ml/yield   │      │ app/ml/advisor          │  │
│  │ (re-export)   │      │ (re-export,    │      │ (re-export)             │  │
│  │               │      │  importlib —   │      │                         │  │
│  │               │      │  "yield" is a  │      │                         │  │
│  │               │      │  keyword)      │      │                         │  │
│  └───────┬───────┘      └───────┬────────┘      └───────────┬─────────────┘  │
│          │                      │                           │                 │
│          ▼                      ▼                           ▼                 │
│  ┌────────────────────────── ML Inference Layer ───────────────────────────┐  │
│  │ training/inference/{disease,yield,advisor}/inference.py                  │  │
│  │  - pure functions extracted from the notebooks (Phase 2)                 │  │
│  │  - no HTTP, no DB — load_*_artifacts() / predict_*() / run_full_pipeline()│  │
│  └───────────────────────────────┬──────────────────────────────────────────┘  │
│                                  │ reads on-disk artifacts                    │
│                                  ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │  artifacts/{disease,yield,advisor}/*.keras *.pkl *.json  (gitignored,   │   │
│  │  uploaded manually — see README § Artifact Upload)                      │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ┌───────────────────────── Persistence Layer ─────────────────────────────┐  │
│  │ backend/app/repositories/*.py   backend/app/models/*.py                  │  │
│  │  PredictionRepository  FileRepository  →  SQLAlchemy  →  data/agriintel.db│  │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ┌───────────────────────── Static File Serving ───────────────────────────┐  │
│  │ StaticFiles mount at /api/uploads → data/uploads/                        │  │
│  │  serves images saved by FileRepository.save() (e.g. disease photos)      │  │
│  │  so the frontend can render them back (history detail view)              │  │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ┌───────────────────────── Integration Layer ─────────────────────────────┐  │
│  │ backend/app/integrations/llm/*.py                                        │  │
│  │  LLMProvider protocol → GroqProvider (real) / GeminiProvider (stub)       │  │
│  └───────────────────────────────────┬───────────────────────────────────┘   │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       ▼
                              ┌──────────────────┐
                              │  Groq Cloud API   │
                              │  llama-3.1-8b-    │
                              │  instant          │
                              └──────────────────┘
```

---

## 2. Frontend Workflows

Every page follows the same shape: local form state (react-hook-form where there's a form) →
call the matching `services/*.ts` function inside `try/catch` → on success, render the result;
on failure, `toast.error(getErrorMessage(err))` and leave form/photo state untouched so the user
can just retry.

### 2.1 Disease Page (`/disease`)

```
Mount
   │  getDiseaseModels() → GET /disease/models  → populate Model dropdown, default active model
   ▼
User selects/drops a leaf photo
   │  local preview via URL.createObjectURL() — no network call yet
   ▼
User clicks "Check my plant"
   │  status → 'loading'
   ▼
predictDisease(file, model)
   │  builds FormData(file, model?) — Content-Type explicitly unset per-request so the
   │  browser sets its own multipart boundary (the shared axios instance's default
   │  Content-Type: application/json would otherwise silently break the upload)
   ▼
POST /disease/predict  ──success──▶  status → 'done', render prediction + treatment advice
                        ──failure──▶  toast.error(...), status → 'ready' (photo kept, retry)
```

### 2.2 Yield Page (`/yield`)

```
Mount
   │  getYieldModels() → GET /yield/models → populate Model dropdown, default model
   ▼
User fills form (Crop is free text w/ <datalist> suggestions; State/Season are dropdowns
   sourced from the real training dataset's categories)
   ▼
Submit → predictYield(request)
   │  omits `model` field entirely if empty (lets backend fall back to its own default)
   ▼
POST /yield/predict  ──success──▶  render animated predicted_yield (useCountUp)
                      ──failure──▶  toast.error(...), form values untouched
```

### 2.3 Soil Page (`/soil`)

```
Two-step form: "info" (State/Soil type/Rainfall/Temperature) → "nutrients" (11 ICAR values)
   │  State/Soil type dropdowns sourced from artifacts/advisor/label_encoders.pkl's exact
   │  trained classes — this module 400s on any other value (LabelEncoder rejects unseen labels)
   ▼
Submit → getSoilAdvice(request)
   │  nutrient values rounded to 2 decimals client-side; all numeric inputs use step="any"
   │  (a step="0.01" HTML5 constraint previously blocked submission of higher-precision input
   │  via the browser's own native validation, never reaching the network)
   ▼
POST /advisor/recommend  ──success──▶  render layer1 (nutrient-by-nutrient) + layer2 (overall
   │                                    health + confidence) + layer3 (multilingual advisory,
   │                                    language-switchable) if generate_llm was true
   └──failure──▶  toast.error(...), form values untouched
```

### 2.4 History List & Detail (`/history`, `/history/:id`)

```
Mount / tab change (All / Plant / Harvest / Soil)
   │  getHistory(1, 20, module?) → GET /history?module=&page=1&page_size=20
   │  resets accumulated items on every filter change
   ▼
"Load more" (visible while items.length < total)
   │  getHistory(nextPage, 20, module?) → appends to the existing list
   ▼
Click a row → navigate to /history/:id
   │  getHistoryItem(id) → GET /history/{id}
   │     404 → resolves to null (not an error) → "we couldn't find that check" state
   ▼
Render by item.module:
   disease → DiseaseDetail (renders the uploaded photo via request_json.image_url, if present —
             older pre-fix history rows won't have one and simply omit the image)
   yield   → YieldDetail (echoes the original request inputs alongside the result)
   advisor → SoilDetail (same nutrient/advisory presentation as the live Soil page result)
```

---

## 3. Backend Startup Workflow (`backend/app/core/lifespan.py`)

```
uvicorn app.main:app
        │
        ▼
1. get_settings()                      ← reads .env (backend/app/core/config.py)
        │
        ▼
2. Base.metadata.create_all(engine)    ← creates prediction_history / uploaded_files
        │                                 tables in data/agriintel.db if missing
        ▼
3. DiseaseService(settings).load()  ─┐
   YieldService(settings).load()    ─┼─  each: check artifact dir exists →
   AdvisorService(settings).load()  ─┘   check required files exist →
        │                                 load_*_artifacts() (real models into memory)
        │                                 → service.status = {loaded, message, missing_files}
        ▼
4. app.state.module_status = {disease, yield, advisor}   ← surfaced by GET /api/health
        │
        ▼
5. Routes registered, server ready to accept requests
```

If artifacts are missing (the default state until you upload them — see README), `loaded: false` is reported per module and the corresponding `/predict` or `/recommend` route returns **503** instead of silently faking a result.

Artifacts are only read from disk at this one startup step — any hand-edit to a `.txt`/`.json`
artifact file (e.g. `prompt_template.txt`) requires a full process restart to take effect, since
`--reload` only watches Python source files, not the `artifacts/` directory.

---

## 4. Module A — Disease Detection Workflow

`POST /api/disease/predict` (multipart/form-data: `file`, optional `model`)

```
Client (frontend/Postman)
   │  multipart: file=leaf.jpg, model=efficientnet (optional)
   ▼
disease.py route
   │  1. service.is_loaded? no → 503
   │  2. image_bytes = await file.read(); empty? → 400
   ▼
DiseaseService.predict(image_bytes, model_name, filename)
   │  1. resolve short model slug ("efficientnet") → notebook display name ("EfficientNetB0")
   │     unknown slug → KeyError → route maps to 400
   │  2. PIL.Image.open(bytes)                      -- invalid image → UnidentifiedImageError → 400
   ▼
app.ml.disease.predict_leaf(image, artifacts, display_name)
   │  (training/inference/disease/inference.py)
   │  1. preprocess_image() per model's {height,width,preprocess_mode} from image_config.json
   │  2. model.predict() → probabilities per class_names.json
   │  3. argmax → label, confidence; HEALTHY_LABEL check → verdict
   │  4. confidence < 0.60 → low_confidence_warning
   ▼
DiseaseService maps result → DiseasePredictResponse shape
   │
   ├──▶ FileRepository.save(filename, image_bytes, module="disease")   [best-effort]
   │        → sanitizes filename to its basename (path-traversal guard)
   │        → writes data/uploads/disease_<filename>, inserts UploadedFile row
   │        → saved path captured → image_url = "/api/uploads/disease_<filename>"
   │           (servable via the StaticFiles mount — see diagram 1)
   │
   └──▶ PredictionRepository.create(module="disease",
   │        request_json={filename, model, image_url}, ...)            [best-effort]
   │            → inserts PredictionHistory row (visible via GET /api/history,
   │              image renders in the frontend's history detail view)
   │
   ▼
200 OK → { prediction: {class_name, confidence, verdict, ...}, top_predictions, model_used, inference_time_ms }
```

---

## 5. Module B — Yield Prediction Workflow

`POST /api/yield/predict` (JSON body)

```
Client
   │  { crop, state, season, annual_rainfall, area, fertilizer, pesticide, year, model? }
   ▼
yield_prediction.py route
   │  service.is_loaded? no → 503
   ▼
YieldService.predict(request_data, model_key)
   │  1. map API field names → notebook PascalCase:
   │     crop→Crop  state→State  season→Season  annual_rainfall→Annual_Rainfall
   │     area→Area  fertilizer→Fertilizer  pesticide→Pesticide  year→Crop_Year
   ▼
app.ml.yield.predict_yield(fields, artifacts, model_key)
   │  (training/inference/yield/inference.py)
   │  1. derive_yield_features(): Fertilizer_per_ha = Fertilizer/Area,
   │                               Pesticide_per_ha = Pesticide/Area
   │  2. select preprocessor (full|min feature set) → preprocessor.transform() ONLY
   │     categorical columns (State/Crop/Season) go through OneHotEncoder(handle_unknown=
   │     'ignore') — an unrecognized value degrades to an all-zero dummy row rather than
   │     erroring, which is what makes the frontend's free-text Crop field safe
   │  3. model.predict(X) → log-space prediction
   │  4. np.clip(np.expm1(prediction), 0, None) → yield in tonnes/ha
   │     unknown model_key / not-loaded model → KeyError → route maps to 400
   ▼
YieldService builds YieldPredictResponse
   │
   └──▶ PredictionRepository.create(module="yield", ...)   [best-effort]
   │
   ▼
200 OK → { predicted_yield, unit: "tonnes/ha", model_used, feature_set, inference_time_ms }
```

---

## 6. Module C — Soil Health Advisor Workflow (3 Layers)

`POST /api/advisor/recommend` (JSON body)

```
Client
   │  { state, district?, soil_type, ph..copper (11 nutrients), rainfall?, temperature?, generate_llm }
   ▼
advisor.py route
   │  service.is_loaded? no → 503
   ▼
AdvisorService.recommend(request_data, generate_llm)
   ▼
app.ml.advisor.run_full_pipeline([request_data], artifacts, generate_llm, llm_provider, languages)
   │  (training/inference/advisor/inference.py)
   │
   │  ── Layer 1: Rule Engine ──────────────────────────────────────────
   │     classify_nutrient(column, value, rules.THRESHOLDS) per nutrient
   │        → status: Deficient / Excessive / Sufficient / Acidic / Alkaline / Neutral
   │     derive_overall_label(statuses) → problem_count → Poor(≥6) / Moderate(3-5) / Good(0-2)
   │
   │  ── Layer 2: Random Forest Classifier ─────────────────────────────
   │     encode soil_type/state via label_encoders.pkl (unseen value → ValueError → 400 —
   │     this is why the frontend's State/Soil type dropdowns must match the encoder's
   │     trained classes exactly, unlike Yield's more forgiving one-hot encoding)
   │     rf_model.predict()/predict_proba() → {prediction, confidence per class}
   │
   │  ── Layer 3: LLM Advisory (only if generate_llm=true) ─────────────
   │     build_prompt(context, prompt_template) — prompt_template.txt is prepended
   │     verbatim as literal text ahead of the real data; it must contain ONLY the
   │     intended system-prompt instruction, not reference/debug text, or the LLM
   │     receives a polluted prompt and produces garbled output (fixed once, see
   │     CLAUDE_LOCAL.md — re-verify after any future artifact re-export)
   │     llm_provider.generate(prompt, temperature, max_tokens)   ─┐
   │        → GroqProvider: real call to Groq chat completions API │
   │        → no GROQ_API_KEY / API error → LLMProviderError ──────┼─→ route: 503
   │     translate_text(english_advisory, language) per configured │
   │        language (deep-translator; skipped if only "English")  ┘
   ▼
AdvisorService maps result → layer1 / layer2 / layer3 (null if generate_llm=false)
   │
   └──▶ PredictionRepository.create(module="advisor", model_name="rf_classifier", ...) [best-effort]
   │
   ▼
200 OK → { layer1: {...}, layer2: {...}, layer3: {...} | null, inference_time_ms }
```

---

## 7. History Workflow

`GET /api/history?module=&page=&page_size=`

```
Client
   ▼
history.py route → Depends(get_prediction_repository)
   ▼
PredictionRepository.list(module, page, page_size)
   │  SELECT * FROM prediction_history [WHERE module = ?]
   │  ORDER BY timestamp DESC  OFFSET (page-1)*page_size  LIMIT page_size
   ▼
200 OK → { items: [...], total, page, page_size }
```

`GET /api/history/{id}`

```
Client
   ▼
history.py route → Depends(get_prediction_repository)
   ▼
PredictionRepository.get_by_id(item_id)
   │  SELECT * FROM prediction_history WHERE id = ?
   ▼
found → 200 OK → single HistoryItem
not found → 404 → {detail: "History item {id} not found", error_code: "NOT_FOUND"}
```

Both are populated automatically — every successful `/predict` or `/recommend` call above writes a row here as a side effect (best-effort; a persistence failure is logged but never fails the original request).

---

## 8. Error-Handling Summary (all modules)

Every error response is shaped uniformly by the global exception handler
(`backend/app/api/errors.py`, registered before routes in `main.py`) into `{detail, error_code}`
— individual routes just raise `HTTPException(status_code=..., detail=...)`; the handler fills
in `error_code` from the status code. `RequestValidationError` (422s) get the same treatment,
with Pydantic's structured error list flattened into a single human-readable `detail` string.

```
┌────────────────────────────┬──────┬───────────────────┬──────────────────────────────┐
│ Condition                  │ Code │ error_code         │ Where                        │
├────────────────────────────┼──────┼───────────────────┼──────────────────────────────┤
│ Service artifacts not loaded│ 503 │ SERVICE_UNAVAILABLE│ route, before calling service │
│ Unknown model / model key   │ 400 │ BAD_REQUEST        │ route catches KeyError        │
│ Unseen soil_type / state    │ 400 │ BAD_REQUEST        │ route catches ValueError      │
│                             │     │                    │ (LabelEncoder)                │
│ Invalid / empty image file  │ 400 │ BAD_REQUEST        │ route catches                 │
│                             │     │                    │ UnidentifiedImageError        │
│ History item not found      │ 404 │ NOT_FOUND          │ history.py, get_by_id() → None│
│ LLM unavailable / API error │ 503 │ SERVICE_UNAVAILABLE│ route catches LLMProviderError│
│                             │     │                    │ / NotImplementedError         │
│                             │     │                    │ (GeminiProvider)              │
│ Pydantic validation failure │ 422 │ VALIDATION_ERROR   │ FastAPI automatic, before      │
│                             │     │                    │ route runs                    │
└────────────────────────────┴──────┴───────────────────┴──────────────────────────────┘
```

The frontend's `lib/apiError.ts` reads `detail` off any Axios error response for the toast
message; `error_code` is available for future programmatic branching but isn't used yet.
