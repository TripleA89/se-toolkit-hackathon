from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db import models
from app.db.session import Base, engine
from app.db.startup_migrations import run_startup_compatibility_migrations

setup_logging()
settings = get_settings()

app = FastAPI(title=settings.project_name, debug=settings.app_debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # Keeps local setup simple; for larger deployments use Alembic migrations.
    Base.metadata.create_all(bind=engine)
    run_startup_compatibility_migrations(engine)


@app.get(f"{settings.api_v1_prefix}/health")
def healthcheck() -> dict[str, str]:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.api_v1_prefix)
