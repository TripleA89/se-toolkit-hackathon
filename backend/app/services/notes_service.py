from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import MeetingNote
from app.db.schemas import NoteAnalyzeRequest, NoteLLMResult
from app.services.llm.base import LLMClient


class NotesService:
    def __init__(self, db: Session, llm_client: LLMClient) -> None:
        self.db = db
        self.llm_client = llm_client

    def analyze_and_store(self, payload: NoteAnalyzeRequest, user_id: UUID) -> MeetingNote:
        llm_result: NoteLLMResult = self.llm_client.analyze_meeting_notes(
            raw_text=payload.raw_text,
            output_language=payload.output_language,
        )

        llm_settings = getattr(self.llm_client, "settings", None)
        llm_model = getattr(self.llm_client, "last_used_model", None) or (
            llm_settings.llm_model if llm_settings else "unknown"
        )
        llm_provider = getattr(self.llm_client, "provider_name", "unknown")

        note = MeetingNote(
            user_id=user_id,
            raw_text=payload.raw_text,
            output_language=payload.output_language,
            summary=llm_result.summary,
            decisions=llm_result.decisions,
            action_items=llm_result.action_items,
            llm_provider=llm_provider,
            llm_model=llm_model,
            prompt_version="v1",
        )

        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)

        return note
