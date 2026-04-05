from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import MeetingNote, User
from app.db.schemas import NoteAnalyzeRequest, NoteResponse
from app.db.session import get_db
from app.services.llm.base import LLMIntegrationError, LLMInvalidResponseError
from app.services.llm.qwen_api import QwenAPIClient
from app.services.notes_service import NotesService

router = APIRouter(prefix="/notes", tags=["notes"])


def get_notes_service(db: Session = Depends(get_db)) -> NotesService:
    return NotesService(db=db, llm_client=QwenAPIClient())


@router.post("/analyze", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def analyze_notes(
    payload: NoteAnalyzeRequest,
    service: NotesService = Depends(get_notes_service),
    current_user: User = Depends(get_current_user),
) -> MeetingNote:
    try:
        return service.analyze_and_store(payload, user_id=current_user.id)
    except LLMIntegrationError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except LLMInvalidResponseError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM returned invalid response: {exc}",
        ) from exc


@router.get("", response_model=list[NoteResponse])
def list_notes(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MeetingNote]:
    return (
        db.query(MeetingNote)
        .filter(MeetingNote.user_id == current_user.id)
        .order_by(desc(MeetingNote.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MeetingNote:
    note = db.query(MeetingNote).filter(MeetingNote.id == note_id, MeetingNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.get("/{note_id}/export/markdown")
def export_note_markdown(
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PlainTextResponse:
    note = db.query(MeetingNote).filter(MeetingNote.id == note_id, MeetingNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    markdown = _note_to_markdown(note)
    filename = f"meeting-note-{note.id}.md"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return PlainTextResponse(content=markdown, media_type="text/markdown", headers=headers)


def _note_to_markdown(note: MeetingNote) -> str:
    decisions = note.decisions or []
    action_items = note.action_items or []
    created_at = note.created_at.isoformat()

    decisions_block = "\n".join(f"- {item}" for item in decisions) if decisions else "- None"
    actions_block = "\n".join(f"- {item}" for item in action_items) if action_items else "- None"

    return (
        "# Meeting Note Summary\n\n"
        f"- ID: `{note.id}`\n"
        f"- Created at: {created_at}\n"
        f"- Output language: `{note.output_language}`\n"
        f"- Model: `{note.llm_model}`\n\n"
        "## Raw Notes\n\n"
        f"{note.raw_text}\n\n"
        "## Summary\n\n"
        f"{note.summary}\n\n"
        "## Decisions\n\n"
        f"{decisions_block}\n\n"
        "## Action Items\n\n"
        f"{actions_block}\n"
    )
