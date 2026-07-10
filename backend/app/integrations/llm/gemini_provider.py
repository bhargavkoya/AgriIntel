"""Google Gemini LLM provider — future implementation stub."""

import logging

from app.integrations.llm.base import LLMProvider

logger = logging.getLogger(__name__)


class GeminiProvider:
    """Google Gemini API provider — swappable alternative to Groq."""

    def __init__(self, api_key: str, model: str = "gemini-pro") -> None:
        self._api_key = api_key
        self._model = model

    async def generate(self, system: str, user: str) -> str:
        """Generate advisory text via Gemini API. Not yet implemented."""
        raise NotImplementedError("GeminiProvider — future implementation")


def create_gemini_provider(api_key: str, model: str = "gemini-pro") -> LLMProvider:
    return GeminiProvider(api_key=api_key, model=model)
