from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def run_startup_compatibility_migrations(engine: Engine) -> None:
    inspector = inspect(engine)

    with engine.begin() as conn:
        if not inspector.has_table("users"):
            conn.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id UUID PRIMARY KEY,
                        username VARCHAR(64) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                    )
                    """
                )
            )

        note_columns = {column["name"] for column in inspector.get_columns("meeting_notes")}
        if "user_id" not in note_columns:
            conn.execute(text("ALTER TABLE meeting_notes ADD COLUMN user_id UUID"))

        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_meeting_notes_user_id ON meeting_notes(user_id)"))
