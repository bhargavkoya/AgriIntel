"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.errors import register_exception_handlers
from app.api.routes import advisor, contact, disease, health, history, yield_prediction
from app.core.config import get_settings
from app.core.lifespan import lifespan
from app.core.logging import setup_logging

settings = get_settings()
setup_logging(settings.log_level)

app = FastAPI(
    title="AgriIntel API",
    description="AI-Powered Agricultural Decision Support System",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

settings.upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(disease.router, prefix="/api")
app.include_router(yield_prediction.router, prefix="/api")
app.include_router(advisor.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
