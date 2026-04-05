from typing import Protocol

from app.db.schemas import NoteLLMResult


class LLMClient(Protocol):
    def analyze_meeting_notes(self, raw_text: str, output_language: str) -> NoteLLMResult:
        """Analyze raw notes and return structured output."""


class LLMIntegrationError(Exception):
    """Raised when an external LLM provider call fails."""


class LLMInvalidResponseError(Exception):
    """Raised when an LLM provider returns invalid output."""
