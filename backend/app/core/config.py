import json
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Meeting Notes Organizer API"
    api_v1_prefix: str = "/api/v1"
    app_debug: bool = False

    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/meeting_notes"

    llm_base_url: str = "https://openrouter.ai/api/v1"
    llm_api_key: str = ""
    llm_model: str = "qwen/qwen3-next-80b-a3b-instruct:free"
    llm_fallback_models: str = "qwen/qwen3.6-plus:free,qwen/qwen3-coder:free"
    llm_timeout_seconds: int = 45
    llm_retry_attempts_per_model: int = 2
    llm_retry_backoff_seconds: float = 1.5

    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 720

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        value = self.cors_origins.strip()
        if not value:
            return []

        # Support both comma-separated format and JSON array format in env.
        if value.startswith("["):
            try:
                parsed = json.loads(value)
            except json.JSONDecodeError:
                parsed = None
            if isinstance(parsed, list):
                return [str(origin).strip() for origin in parsed if str(origin).strip()]

        return [origin.strip() for origin in value.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
