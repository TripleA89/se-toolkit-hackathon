# Lab 9 Task 5 — 5-Slide Presentation Template

Use this file to prepare the exact content for your Moodle presentation.

## Slide 1 — Title

- Product title: Meeting Notes Organizer
- Name: <Your Name>
- University email: <Your University Email>
- Group: <Your Group>

## Slide 2 — Context

- End user: students, small teams, professionals
- Problem: messy notes cause missed decisions and forgotten tasks
- One-sentence idea: a web app that converts raw meeting notes into summary, decisions, and action items

## Slide 3 — Implementation

- Stack:
  - Frontend: React + Vite + TypeScript
  - Backend: FastAPI
  - DB: PostgreSQL
  - LLM: Qwen free API (OpenAI-compatible)
  - Infra: Docker Compose
- Version 1:
  - analyze raw notes
  - output structured result
  - save to DB
- Version 2:
  - auth (login/password)
  - per-user history
  - markdown export
  - RU/EN switch
  - deployability on Ubuntu VM
- TA feedback addressed:
  - persistent history by user
  - better UX and clearer UI
  - deployment-ready setup

## Slide 4 — Demo (Most Important)

- Insert pre-recorded video (voice-over), max 2 minutes
- Suggested flow:
  - register/login
  - paste notes and analyze
  - show generated summary/decisions/action items
  - open history and prove per-user persistence
  - export markdown

## Slide 5 — Links

Add link and QR code for:

- GitHub repository with product code
- Deployed product URL (latest version)

Placeholders:

- GitHub: <https://github.com/<username>/se-toolkit-hackathon>
- Deploy: <http://<VM_IP>:5173 or domain>
