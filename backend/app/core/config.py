"""Application configuration from environment variables."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    """Central configuration loaded from .env file."""

    model_config = SettingsConfigDict(
        env_file=_REPO_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    log_level: str = "INFO"
    database_url: str = "sqlite:///./data/agriintel.db"

    artifacts_disease_path: str = "artifacts/disease"
    artifacts_yield_path: str = "artifacts/yield"
    artifacts_advisor_path: str = "artifacts/advisor"

    llm_provider: str = "groq"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    groq_temperature: float = 0.3
    groq_max_tokens: int = 400

    upload_dir: str = "data/uploads"
    max_upload_size_mb: int = 10

    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def repo_root(self) -> Path:
        """Resolve repository root."""
        return _REPO_ROOT

    @property
    def disease_artifacts_path(self) -> Path:
        return self.repo_root / self.artifacts_disease_path

    @property
    def yield_artifacts_path(self) -> Path:
        return self.repo_root / self.artifacts_yield_path

    @property
    def advisor_artifacts_path(self) -> Path:
        return self.repo_root / self.artifacts_advisor_path

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
