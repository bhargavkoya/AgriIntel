"""LLM provider protocol — abstract interface for Layer 3 advisory generation."""

from typing import Protocol


class LLMProvider(Protocol):
    """Protocol for LLM text generation. Implementations: Groq, Gemini."""

    async def generate(self, system: str, user: str) -> str:
        """Generate text from system and user prompts."""
        ...
