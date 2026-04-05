import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    notes: Mapped[list["MeetingNote"]] = relationship(back_populates="user")


class MeetingNote(Base):
    __tablename__ = "meeting_notes"
    __table_args__ = (
        CheckConstraint("output_language IN ('ru', 'en')", name="ck_meeting_notes_output_language"),
        Index("idx_meeting_notes_created_at", "created_at"),
        Index("idx_meeting_notes_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    output_language: Mapped[str] = mapped_column(String(2), nullable=False)

    summary: Mapped[str] = mapped_column(Text, nullable=False)
    decisions: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    action_items: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    llm_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    llm_model: Mapped[str] = mapped_column(String(120), nullable=False)
    prompt_version: Mapped[str] = mapped_column(String(20), nullable=False, default="v1")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped[User | None] = relationship(back_populates="notes")
