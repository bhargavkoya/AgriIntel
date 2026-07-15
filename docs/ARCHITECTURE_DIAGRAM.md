# AgriIntel — Architecture Diagram & Layer-by-Layer Workflows

ASCII reference for the actual, currently-implemented system (post sub-phase 3.3). For narrative design principles see [ARCHITECTURE.md](ARCHITECTURE.md); this document is the visual/workflow companion.

---

## 1. System-Level Diagram

```
                                   ┌────────────────────────────┐
                                   │   Browser (React 19 SPA)   │
                                   │   frontend/src/*            │
                                   └──────────────┬─────────────┘
                                                  │ REST/JSON (axios)
                                                  │ http://localhost:5173 → :8000
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          FastAPI app (backend/app/main.py)                    │
│                                                                                │
│  ┌──────────────────────────── API Layer ─────────────────────────────────┐  │
│  │ backend/app/api/routes/*.py            backend/app/schemas/api.py       │  │
│  │  health.py   disease.py   yield_prediction.py   advisor.py  history.py  │  │
│  │  - validates request via Pydantic schema                                │  │
│  │  - raises 503 (not loaded) / 400 (bad input) / 422 (validation)         │  │
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

## 2. Startup Workflow (`backend/app/core/lifespan.py`)

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

---

## 3. Module A — Disease Detection Workflow

`POST /api/disease/predict` (multipart/form-data: `file`, optional `model`)

```
Client (Postman/React)
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
   │        → writes data/uploads/disease_<filename>, inserts UploadedFile row
   │
   └──▶ PredictionRepository.create(module="disease", ...)            [best-effort]
            → inserts PredictionHistory row (visible via GET /api/history)
   │
   ▼
200 OK → { prediction: {class_name, confidence, verdict, ...}, top_predictions, model_used, inference_time_ms }
```

---

## 4. Module B — Yield Prediction Workflow

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

## 5. Module C — Soil Health Advisor Workflow (3 Layers)

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
   │     encode soil_type/state via label_encoders.pkl (unseen value → ValueError → 400)
   │     rf_model.predict()/predict_proba() → {prediction, confidence per class}
   │
   │  ── Layer 3: LLM Advisory (only if generate_llm=true) ─────────────
   │     build_prompt(context, prompt_template)
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

## 6. History Workflow

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

This is populated automatically — every successful `/predict` or `/recommend` call above writes a row here as a side effect (best-effort; a persistence failure is logged but never fails the original request).

---

## 7. Error-Handling Summary (all modules)

```
┌────────────────────────────┬──────┬─────────────────────────────────────────┐
│ Condition                  │ Code │ Where                                    │
├────────────────────────────┼──────┼─────────────────────────────────────────┤
│ Service artifacts not loaded│ 503 │ route, before calling service            │
│ Unknown model / model key   │ 400 │ route catches KeyError from service      │
│ Unseen soil_type / state    │ 400 │ route catches ValueError (LabelEncoder)  │
│ Invalid / empty image file  │ 400 │ route catches UnidentifiedImageError     │
│ LLM unavailable / API error │ 503 │ route catches LLMProviderError /         │
│                             │     │ NotImplementedError (GeminiProvider)     │
│ Pydantic validation failure │ 422 │ FastAPI automatic, before route runs     │
└────────────────────────────┴──────┴─────────────────────────────────────────┘
```
