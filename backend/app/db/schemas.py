from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NoteAnalyzeRequest(BaseModel):
    raw_text: str = Field(..., min_length=1, max_length=20000)
    output_language: str = Field(default="ru", pattern="^(ru|en)$")


class NoteLLMResult(BaseModel):
    summary: str
    decisions: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)


class NoteResponse(BaseModel):
    id: UUID
    raw_text: str
    output_language: str
    summary: str
    decisions: list[str]
    action_items: list[str]
    llm_provider: str
    llm_model: str
    prompt_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(..., min_length=6, max_length=128)


class UserLoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: UUID
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
