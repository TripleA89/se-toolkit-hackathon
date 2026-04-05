# Implementation Plan — Meeting Notes Organizer

## Product Idea

- End user: students, small teams, and professionals who run meetings
- Problem: messy notes are hard to review, so decisions and tasks are missed
- One-sentence idea: convert raw meeting notes into structured summary, decisions, and action items
- Core feature: submit raw notes and instantly get structured output saved to history

## Required Architecture

- Frontend: React + Vite (end-user web app)
- Backend: FastAPI (API + LLM orchestration)
- Database: PostgreSQL (users + meeting history)
- LLM: free Qwen API via OpenAI-compatible endpoint
- Deployment: Docker Compose on Ubuntu VM

## Version 1 (MVP)

### Goal

Deliver one core workflow end-to-end.

### Scope

- Input raw meeting notes in textarea
- Backend calls Qwen model and returns structured JSON
- Show summary, decisions, action items in UI
- Persist analysis result in PostgreSQL

### Version 1 API

- `POST /api/v1/notes/analyze`

### Done Criteria

- User can submit notes and receive structured output
- Result is stored and can be retrieved from DB
- Flow is stable enough for TA walkthrough

## Version 2

### Goal

Upgrade MVP into a deployable product with better usability.

### Scope

- User auth: register/login/me
- Personal history per user (isolated access)
- History page with pagination
- Markdown export for a saved analysis
- RU/EN language switch in frontend
- Better error handling and polished UI
- Dockerized deployment on VM by IP

### Version 2 API

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/notes/analyze`
- `GET /api/v1/notes`
- `GET /api/v1/notes/{id}`
- `GET /api/v1/notes/{id}/export/markdown`

### TA Feedback Addressed

- Added persistent per-user history
- Improved UX clarity and visual design
- Added deployment-ready Docker Compose instructions

## LLM Integration Strategy

- Primary model: `qwen/qwen3-next-80b-a3b-instruct:free`
- Fallback models: configured in `.env`
- Prompt asks for strict JSON: `summary`, `decisions`, `action_items`
- Backend validates response format and returns clear errors for invalid model output

## Risks and Mitigations

- Free API rate limits: retry with backoff and fallback models
- Invalid LLM response format: strict parser + user-friendly error
- Deployment drift: single Docker Compose entrypoint and documented env setup

## Delivery Checklist

- [x] Backend + DB + frontend implemented
- [x] V1 core feature implemented
- [x] V2 functionality implemented
- [x] Dockerized and runnable on Ubuntu VM
- [ ] Final demo video (<=2 min) for Moodle
- [ ] Presentation slides (5 slides) for Moodle
