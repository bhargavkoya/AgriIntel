"""LLM provider protocol — abstract interface for Layer 3 advisory generation."""

from typing import Protocol

DEFAULT_TEMPERATURE = 0.3
DEFAULT_MAX_TOKENS = 400


class LLMProvider(Protocol):
    """Protocol for LLM text generation. Implementations: Groq, Gemini.

    Matches the synchronous, single-prompt signature that
    training/inference/advisor/inference.py's generate_english_advisory() calls.
    """

    def generate(self, prompt: str, *, temperature: float = DEFAULT_TEMPERATURE, max_tokens: int = DEFAULT_MAX_TOKENS) -> str:
        """Generate text for a single prompt string."""
        ...
