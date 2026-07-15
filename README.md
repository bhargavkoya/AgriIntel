# AgriIntel

AI-Powered Agricultural Decision Support System — MSc Thesis Project.

AgriIntel integrates three independent AI modules into a unified web platform:

- **Module A** — Crop Disease Detection (TensorFlow CNN)
- **Module B** — Crop Yield Prediction (Scikit-learn ensemble)
- **Module C** — Soil Health Advisor (Rules + RF + LLM)

## Project Structure

```
AgriIntel/
├── artifacts/          # Exported model artifacts (upload manually)
├── training/           # Colab notebooks (source of truth for ML logic)
├── backend/            # FastAPI application
├── frontend/           # React 19 + Material UI application
├── docs/               # Architecture and API documentation
└── data/               # SQLite database and uploaded files
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- Exported artifact bundles from Colab notebooks

## Artifact Upload

Artifacts are **not** committed to git. Upload them manually after running the training notebooks in Colab.

### Module A — Disease Detection

1. Run `training/ModeuleA_CropDiseaseDetection_Thesis_Implementation_BhargavaKoya_20075511.ipynb`
2. Download `disease_artifacts.zip`
3. Extract into `artifacts/disease/`
4. See [artifacts/disease/README.md](artifacts/disease/README.md) for required files

### Module B — Yield Prediction

1. Run `training/ModuleB_CropYieldPrediction_Thesis_Implementation_BhargavaKoya_20075511.ipynb`
2. Download `yield_artifacts.zip`
3. Extract into `artifacts/yield/` (preserve `models/` subdirectory)
4. See [artifacts/yield/README.md](artifacts/yield/README.md) for required files

### Module C — Soil Health Advisor

1. Run `training/ModuleC_SoilHealthCardDigitization_Thesis_Implementation_BhargavaKoya_20075511.ipynb`
2. Download `advisor_artifacts.zip`
3. Extract into `artifacts/advisor/`
4. See [artifacts/advisor/README.md](artifacts/advisor/README.md) for required files

## Quick Start

### Backend

```bash
cp .env.example .env
# Edit .env with your GROQ_API_KEY for Module C

cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/api/health

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dev server: http://localhost:5173

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and layer responsibilities |
| [docs/ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md) | ASCII architecture diagram and layer-by-layer request workflows |
| [docs/ARTIFACT_CONTRACTS.md](docs/ARTIFACT_CONTRACTS.md) | Per-module artifact file schemas |
| [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) | REST API endpoint specifications |
| [docs/ARCHITECTURAL_CONSTRAINTS.md](docs/ARCHITECTURAL_CONSTRAINTS.md) | Hard architectural rules |
| [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) | Decision log |

## Testing the API Locally (Postman)

Once artifacts are uploaded (see above) and the backend is running:

1. **Configure `.env`** at the repo root (copy from `.env.example`). Set `GROQ_API_KEY` if you want to test `/api/advisor/recommend` with `generate_llm: true`; leave it blank otherwise and pass `generate_llm: false`.
2. **Start the backend** (see Quick Start above): `cd backend && uvicorn app.main:app --reload --port 8000`.
3. **Check `GET http://localhost:8000/api/health`** first — each module reports `loaded: true/false`. A module reporting `false` means its artifacts aren't uploaded yet (or are incomplete); its `/predict` or `/recommend` endpoint will return `503` until fixed.
4. **Import the Postman collection**: in Postman, `File → Import → docs/postman/AgriIntel.postman_collection.json`. It includes every endpoint below with example request bodies. The collection variable `baseUrl` defaults to `http://localhost:8000` — change it if you're running on a different port.
5. **Try the requests, in this order** (a module must report `loaded: true` in the health check before its predict/recommend request will succeed):
   - `GET /api/health`
   - `POST /api/disease/predict` — form-data body, key `file` = a leaf image (JPEG/PNG), optional key `model` = `custom` | `efficientnet` | `resnet` | `vgg16`
   - `GET /api/disease/models`
   - `POST /api/yield/predict` — raw JSON body (see collection for example fields)
   - `GET /api/yield/models`
   - `POST /api/advisor/recommend` — raw JSON body; set `generate_llm: false` unless `GROQ_API_KEY` is configured
   - `GET /api/advisor/languages`
   - `GET /api/history` — every successful predict/recommend call above is logged here automatically

   Interactive Swagger docs are also available at `http://localhost:8000/docs` if you want to explore the schemas directly.
6. **Common responses**: `503` = module not loaded (missing/incomplete artifacts) or LLM unavailable; `400` = bad input (unknown model name, unseen `soil_type`/`state`, invalid image); `422` = request body failed schema validation.

For the full request/response flow through each layer (API → Service → ML inference → artifacts → persistence), see [docs/ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md).

## Development Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Architecture and scaffolding | Complete |
| 2 | Notebook inference extraction | Complete |
| 3 | Backend services and API | Complete (real inference, persistence, and LLM wiring done; awaiting real trained artifacts to exercise end-to-end) |
| 4 | React frontend pages | Pending |
| 5 | End-to-end integration | Pending |
| 6 | Docker deployment | Pending |

## License

MSc Thesis Project — Bhargava Koya (20075511)
