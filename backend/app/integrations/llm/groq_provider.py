"""Groq LLM provider — notebook-faithful implementation. Phase 3."""

import logging

from app.integrations.llm.base import LLMProvider

logger = logging.getLogger(__name__)


class GroqProvider:
    """Groq API provider using llama-3.1-8b-instant (Module C notebook defaults)."""

    def __init__(
        self,
        api_key: str,
        model: str = "llama-3.1-8b-instant",
        temperature: float = 0.3,
        max_tokens: int = 400,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._temperature = temperature
        self._max_tokens = max_tokens
        self._client = None

    def generate(self, prompt: str, *, temperature: float | None = None, max_tokens: int | None = None) -> str:
        """Generate advisory text via Groq API. Implemented in sub-phase 3.3."""
        raise NotImplementedError("GroqProvider.generate() — sub-phase 3.3")


def create_groq_provider(
    api_key: str,
    model: str = "llama-3.1-8b-instant",
    temperature: float = 0.3,
    max_tokens: int = 400,
) -> LLMProvider:
    return GroqProvider(api_key=api_key, model=model, temperature=temperature, max_tokens=max_tokens)
