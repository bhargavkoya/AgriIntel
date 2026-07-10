# AI-Powered Agricultural Decision Support System

## Overview

Develop a production-ready full-stack AI web application for an MSc thesis.

The system integrates three independent AI modules into one unified platform.

The architecture should follow clean architecture principles and separate:

- Training
- Model Artifacts
- Backend
- Frontend

Training notebooks should NEVER be executed by the application.

The backend should only consume exported trained models.

---

# Technology Stack

## Frontend

React 19
Material UI
React Router
Axios
React Hook Form
Chart.js
Framer Motion

## Backend

Python 3.11

FastAPI

Pydantic

Uvicorn

TensorFlow

Scikit-learn

XGBoost

Joblib

Pandas

NumPy

Google Gemini API

Google Translator

SQLite

SQLAlchemy

Docker

---

# System Modules

Module A

Crop Disease Detection

TensorFlow CNN Models

Models

Custom CNN

ResNet50

EfficientNetB0

VGG16

Input

Leaf Image

Output

Disease Name

Confidence

Top 3 Predictions

Inference Time

---

Module B

Crop Yield Prediction

Models

Random Forest

XGBoost

HistGradientBoosting

Input

Crop

State

Season

Rainfall

Area

Fertilizer

Pesticide

Year

Output

Predicted Yield

SHAP Explanation

Feature Importance

---

Module C

Soil Health Advisor

Pipeline

Input

Soil Parameters

↓

Rule Engine

↓

Random Forest Model

↓

Prompt Builder

↓

Gemini

↓

Translator

↓

Advice

Languages

English

Hindi

Telugu

---

Application Features

Dashboard

Disease Detection

Yield Prediction

Soil Health Advisor

Prediction History

Model Comparison

About

Settings

---

Backend Architecture

Use Clean Architecture.

backend/

app/

api/

controllers/

services/

repositories/

schemas/

models/

artifacts/

utils/

config/

database/

middleware/

logs/

tests/

---

Frontend Architecture

frontend/

src/

components/

pages/

layouts/

services/

hooks/

context/

assets/

styles/

utils/

---

Training Folder

training/

module_a/

module_b/

module_c/

Training notebooks remain here.

Never import notebook code into backend.

---

Artifacts

artifacts/

disease/

yield/

advisor/

Disease Artifacts

custom.keras

resnet50.keras

efficientnet.keras

vgg16.keras

class_names.json

image_config.json

metrics.json

Yield Artifacts

rf_pipeline.pkl

xgb_pipeline.pkl

hgb_pipeline.pkl

feature_columns.json

metrics.json

Advisor Artifacts

soil_pipeline.pkl

rule_thresholds.json

prompt_template.txt

metadata.json

---

Backend Services

DiseaseService

Responsibilities

Load CNN models once

Preprocess image

Predict disease

Return probabilities

YieldService

Responsibilities

Load ML pipelines

Validate request

Predict yield

Generate SHAP explanation

AdvisorService

Responsibilities

Run Rule Engine

Run RF Model

Generate Prompt

Call Gemini

Translate Result

Return Response

---

Database

SQLite

Tables

PredictionHistory

UploadedFiles

SystemLogs

---

PredictionHistory

id

module

model

timestamp

request_json

response_json

latency

---

UploadedFiles

id

filename

path

uploaded_at

---

REST APIs

POST

/api/disease/predict

POST

/api/yield/predict

POST

/api/advisor/recommend

GET

/api/history

GET

/api/models

---

Non Functional Requirements

Follow SOLID Principles.

Use Dependency Injection.

Use Pydantic Validation.

No duplicated code.

No business logic inside API routes.

Business logic must exist only inside Services.

All models load once during startup.

Every endpoint must return proper HTTP status codes.

Implement structured logging.

Use environment variables.

Never hardcode API keys.

---

Frontend Pages

Dashboard

Disease Detection

Yield Prediction

Soil Health Advisor

History

About

---

Dashboard

Cards

Recent Predictions

Performance Charts

Quick Navigation

---

Disease Detection

Upload Image

Preview

Select Model

Predict

Result Card

Confidence

Top Predictions

---

Yield Prediction

Input Form

Select Model

Predict

Charts

Feature Importance

---

Soil Advisor

Input Parameters

Rule Output

ML Output

AI Advice

Language Selector

Export PDF

---

Development Phases

Phase 1

Setup Repository

Folder Structure

Dependencies

Configuration

---

Phase 2

Implement Backend

Services

Routers

Database

Logging

---

Phase 3

Implement Module A

TensorFlow Service

Inference

API

---

Phase 4

Implement Module B

Pipelines

Prediction

SHAP

---

Phase 5

Implement Module C

Rule Engine

RF Model

Gemini

Translation

---

Phase 6

React Frontend

All Pages

API Integration

Charts

---

Phase 7

Docker

Deployment

Testing

Documentation

---

Coding Guidelines

Use type hints.

Use docstrings.

Use async APIs where possible.

Write modular reusable code.

Use service classes.

Separate DTOs from Models.

No hardcoded paths.

Configuration must come from .env.

Return JSON responses.

Follow production-level coding standards.

The codebase should be easily extensible for future ML models.
