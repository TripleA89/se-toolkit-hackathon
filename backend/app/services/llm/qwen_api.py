import json
import time

import httpx

from app.core.config import get_settings
from app.db.schemas import NoteLLMResult
from app.services.llm.base import LLMIntegrationError, LLMInvalidResponseError

PROMPT_VERSION = "v1"

SYSTEM_PROMPT_TEMPLATE = """You are an assistant that extracts structured information from meeting notes.
Return ONLY valid JSON with this exact shape:
{{
  "summary": "string",
  "decisions": ["string"],
  "action_items": ["string"]
}}
Rules:
- No markdown and no extra text.
- summary must be concise (3-6 sentences).
- decisions must include only explicit agreed decisions.
- action_items must include only concrete tasks.
- Output language must be: {output_language}.
"""


class QwenAPIClient:
    provider_name = "qwen_api"

    def __init__(self) -> None:
        self.settings = get_settings()
        self.last_used_model: str | None = None

    def analyze_meeting_notes(self, raw_text: str, output_language: str) -> NoteLLMResult:
        if not self.settings.llm_api_key:
            raise LLMIntegrationError("LLM_API_KEY is not configured")

        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT_TEMPLATE.format(output_language=output_language),
            },
            {
                "role": "user",
                "content": raw_text,
            },
        ]

        headers = {
            "Authorization": f"Bearer {self.settings.llm_api_key}",
            "Content-Type": "application/json",
        }

        base_url = self.settings.llm_base_url.rstrip("/")
        url = f"{base_url}/chat/completions"

        response = None
        response_data: dict | None = None
        errors: list[str] = []
        for model in self._models_to_try():
            retry_attempts = max(0, self.settings.llm_retry_attempts_per_model)
            for attempt in range(retry_attempts + 1):
                payload = {
                    "model": model,
                    "temperature": 0.2,
                    "messages": messages,
                }
                try:
                    response = httpx.post(
                        url,
                        headers=headers,
                        json=payload,
                        timeout=self.settings.llm_timeout_seconds,
                    )
                    response.raise_for_status()

                    parsed_data: dict | None = None
                    try:
                        raw_data = response.json()
                        if isinstance(raw_data, dict):
                            parsed_data = raw_data
                    except ValueError:
                        parsed_data = None

                    if parsed_data and "error" in parsed_data:
                        error_payload = parsed_data.get("error")
                        provider_code = (
                            error_payload.get("code")
                            if isinstance(error_payload, dict)
                            else None
                        )
                        details_short = str(error_payload)[:220]
                        errors.append(
                            f"{model} (attempt {attempt + 1}) -> provider error {provider_code}: {details_short}"
                        )
                        response = None
                        if provider_code in {429, 503} and attempt < retry_attempts:
                            self._sleep_before_retry(attempt)
                            continue
                        if provider_code in {404, 429, 503}:
                            break
                        raise LLMIntegrationError(f"LLM provider error payload: {error_payload}")

                    self.last_used_model = model
                    response_data = parsed_data
                    break
                except httpx.HTTPStatusError as exc:
                    details = exc.response.text.strip()
                    details_short = details[:220] if details else "No response body"
                    errors.append(
                        f"{model} (attempt {attempt + 1}) -> HTTP {exc.response.status_code}: {details_short}"
                    )
                    response = None

                    if exc.response.status_code in {429, 503} and attempt < retry_attempts:
                        self._sleep_before_retry(attempt)
                        continue
                    if exc.response.status_code in {404, 429, 503}:
                        break

                    raise LLMIntegrationError(
                        f"LLM request failed with {exc.response.status_code}: {details_short}"
                    ) from exc
                except httpx.HTTPError as exc:
                    errors.append(f"{model} (attempt {attempt + 1}) -> HTTP client error: {exc}")
                    response = None
                    if attempt < retry_attempts:
                        self._sleep_before_retry(attempt)
                        continue
                    break

            if response is not None:
                break

        if response is None:
            raise LLMIntegrationError(
                "All configured LLM models failed. "
                + " | ".join(errors[:3])
            )

        if response_data is None:
            try:
                data = response.json()
            except ValueError as exc:
                raise LLMInvalidResponseError("LLM returned non-JSON HTTP response") from exc
        else:
            data = response_data

        try:
            parsed_content = self._extract_structured_payload(data)
        except LLMInvalidResponseError:
            raise
        except Exception as exc:
            preview = str(data)[:280]
            raise LLMInvalidResponseError(
                f"LLM response format is invalid. Raw preview: {preview}"
            ) from exc

        if not isinstance(parsed_content, dict):
            raise LLMInvalidResponseError("LLM payload root must be a JSON object")

        try:
            return NoteLLMResult.model_validate(parsed_content)
        except Exception as exc:
            raise LLMInvalidResponseError("LLM JSON does not match expected schema") from exc

    @staticmethod
    def _parse_json_content(content: str) -> dict:
        normalized = content.strip()

        if normalized.startswith("```"):
            normalized = normalized.strip("`")
            if normalized.lower().startswith("json"):
                normalized = normalized[4:].strip()

        try:
            parsed = json.loads(normalized)
        except json.JSONDecodeError:
            # Some models add prose before/after JSON. Try to recover the first JSON object.
            extracted = QwenAPIClient._extract_first_json_object(normalized)
            if extracted is None:
                raise LLMInvalidResponseError("LLM returned non-JSON content")
            try:
                parsed = json.loads(extracted)
            except json.JSONDecodeError as exc:
                raise LLMInvalidResponseError("LLM returned malformed JSON content") from exc

        if not isinstance(parsed, dict):
            raise LLMInvalidResponseError("LLM JSON root must be an object")

        return parsed

    @staticmethod
    def _extract_structured_payload(data: dict) -> dict:
        choices = data.get("choices")
        if not isinstance(choices, list) or not choices:
            preview = str(data)[:280]
            raise LLMInvalidResponseError(
                f"LLM response has no choices. Raw preview: {preview}"
            )

        first_choice = choices[0]
        if not isinstance(first_choice, dict):
            raise LLMInvalidResponseError("LLM choice item is invalid")

        message = first_choice.get("message")
        if isinstance(message, dict):
            parsed = message.get("parsed")
            if isinstance(parsed, dict):
                return parsed

            tool_calls = message.get("tool_calls")
            parsed_from_tools = QwenAPIClient._parse_tool_calls(tool_calls)
            if parsed_from_tools is not None:
                return parsed_from_tools

            content = message.get("content")
            content_text = QwenAPIClient._content_to_text(content)
            if content_text:
                return QwenAPIClient._parse_json_content(content_text)

        # Fallback for providers that return plain text at choice level.
        content_text = QwenAPIClient._content_to_text(first_choice.get("text"))
        if content_text:
            return QwenAPIClient._parse_json_content(content_text)

        raise LLMInvalidResponseError("LLM response format is invalid")

    @staticmethod
    def _parse_tool_calls(tool_calls: object) -> dict | None:
        if not isinstance(tool_calls, list):
            return None

        for call in tool_calls:
            if not isinstance(call, dict):
                continue
            function_obj = call.get("function")
            if not isinstance(function_obj, dict):
                continue
            args = function_obj.get("arguments")
            if isinstance(args, dict):
                return args
            if isinstance(args, str):
                try:
                    parsed = json.loads(args)
                except json.JSONDecodeError:
                    continue
                if isinstance(parsed, dict):
                    return parsed
        return None

    @staticmethod
    def _content_to_text(content: object) -> str:
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts: list[str] = []
            for item in content:
                if isinstance(item, str):
                    parts.append(item)
                    continue
                if not isinstance(item, dict):
                    continue
                for key in ("text", "content", "value"):
                    value = item.get(key)
                    if isinstance(value, str):
                        parts.append(value)
                        break
            return "\n".join(part.strip() for part in parts if part and part.strip())
        return ""

    @staticmethod
    def _extract_first_json_object(text: str) -> str | None:
        start = text.find("{")
        if start < 0:
            return None

        depth = 0
        in_string = False
        escape = False
        for index in range(start, len(text)):
            char = text[index]
            if in_string:
                if escape:
                    escape = False
                    continue
                if char == "\\":
                    escape = True
                    continue
                if char == '"':
                    in_string = False
                continue

            if char == '"':
                in_string = True
                continue

            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    return text[start : index + 1]

        return None

    def _models_to_try(self) -> list[str]:
        primary = self.settings.llm_model.strip()
        fallbacks = [
            model.strip()
            for model in self.settings.llm_fallback_models.split(",")
            if model.strip()
        ]

        models: list[str] = []
        for model in [primary, *fallbacks]:
            if model and model not in models:
                models.append(model)
        return models

    def _sleep_before_retry(self, attempt: int) -> None:
        # Exponential-ish backoff: base, 2x base, 3x base...
        delay = self.settings.llm_retry_backoff_seconds * (attempt + 1)
        time.sleep(delay)
