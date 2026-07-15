"""Groq LLM provider — notebook-faithful implementation (llama-3.1-8b-instant)."""

import logging

from app.integrations.llm.base import LLMProvider, LLMProviderError

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

    def _get_client(self):
        if not self._api_key:
            raise LLMProviderError("GROQ_API_KEY is not configured")

        if self._client is None:
            from groq import Groq

            self._client = Groq(api_key=self._api_key)
        return self._client

    def generate(self, prompt: str, *, temperature: float | None = None, max_tokens: int | None = None) -> str:
        """Generate advisory text via the Groq chat completions API."""
        client = self._get_client()

        try:
            response = client.chat.completions.create(
                model=self._model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature if temperature is not None else self._temperature,
                max_tokens=max_tokens if max_tokens is not None else self._max_tokens,
            )
        except Exception as exc:  # noqa: BLE001 - groq SDK errors (auth, rate limit, network)
            raise LLMProviderError(f"Groq API error: {exc}") from exc

        return response.choices[0].message.content


def create_groq_provider(
    api_key: str,
    model: str = "llama-3.1-8b-instant",
    temperature: float = 0.3,
    max_tokens: int = 400,
) -> LLMProvider:
    return GroqProvider(api_key=api_key, model=model, temperature=temperature, max_tokens=max_tokens)
