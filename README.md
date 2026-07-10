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
| [docs/ARTIFACT_CONTRACTS.md](docs/ARTIFACT_CONTRACTS.md) | Per-module artifact file schemas |
| [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) | REST API endpoint specifications |
| [docs/ARCHITECTURAL_CONSTRAINTS.md](docs/ARCHITECTURAL_CONSTRAINTS.md) | Hard architectural rules |
| [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) | Decision log |

## Development Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Architecture and scaffolding | Complete |
| 2 | Notebook inference extraction | Pending |
| 3 | Backend services and API | Pending |
| 4 | React frontend pages | Pending |
| 5 | End-to-end integration | Pending |
| 6 | Docker deployment | Pending |

## License

MSc Thesis Project — Bhargava Koya (20075511)
