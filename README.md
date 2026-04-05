# Meeting Notes Organizer

Web app that converts raw meeting notes into a structured summary, decisions, and action items.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- LLM: Qwen via free API (OpenAI-compatible endpoint)
- Deployment: Docker Compose

## Quick Start (Local Docker)

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set your API key in `.env`:

```bash
LLM_API_KEY=your_real_api_key
LLM_MODEL=qwen/qwen3-next-80b-a3b-instruct:free
LLM_FALLBACK_MODELS=qwen/qwen3.6-plus:free,qwen/qwen3-coder:free
LLM_RETRY_ATTEMPTS_PER_MODEL=2
LLM_RETRY_BACKOFF_SECONDS=1.5
```

3. Start services:

```bash
docker compose up --build
```

4. Open app:

- Frontend: http://localhost:5173
- Backend docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

## API

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/notes/analyze`
- `GET /api/v1/notes?limit=20&offset=0`
- `GET /api/v1/notes/{id}`
- `GET /api/v1/notes/{id}/export/markdown`
- `GET /api/v1/health`

Notes API behavior:
- All `/notes/*` endpoints require `Authorization: Bearer <token>`.
- History is saved in PostgreSQL and isolated per authenticated user.

### Analyze Request

```json
{
  "raw_text": "Meeting notes...",
  "output_language": "ru"
}
```

### Auth Requests

Register:

```json
{
  "username": "team_lead",
  "password": "strong_password"
}
```

Login response:

```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "expires_in_seconds": 43200
}
```

### Analyze Response (example)

```json
{
  "id": "uuid",
  "raw_text": "Meeting notes...",
  "output_language": "ru",
  "summary": "...",
  "decisions": ["..."],
  "action_items": ["..."],
  "llm_provider": "qwen_api",
  "llm_model": "qwen/...",
  "prompt_version": "v1",
  "created_at": "2026-04-05T12:00:00Z"
}
```

## Deployment on Ubuntu VM

1. Install Docker + Docker Compose plugin.
2. Clone repo and configure `.env`.
3. Run:

```bash
docker compose up --build -d
```

4. Open `http://<VM_IP>:5173`.

## Notes

- Current backend auto-creates tables on startup for simplicity.
- For stricter production workflows, add Alembic migrations before release.
