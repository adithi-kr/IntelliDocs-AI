# IntelliDocs AI 📚

An AI study desk for students. Upload a PDF and get a **summary, study notes, key points, viva flashcards and an MCQ quiz**, then ask an AI tutor questions about it.

## Features
- PDF upload → AI-generated study pack (via OpenRouter)
- Viva flashcards (tap to reveal) and a scored MCQ quiz
- Chat with any document, with follow-up context
- Download the notes as a PDF
- Accounts with JWT auth; each user only sees their own documents
- Light-blue / light-brown theme with a night mode, responsive on mobile

## Tech stack
**Frontend:** React 19, Vite, React Router, Axios, Bootstrap Icons
**Backend:** FastAPI, SQLAlchemy (SQLite), pypdf, ReportLab, OpenRouter API

## Run locally

**1. Backend** (http://127.0.0.1:8000)
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "OPENROUTER_API_KEY=your_key_here" > .env
uvicorn app.main:app --reload --port 8000
```

**2. Frontend** (http://localhost:5173)
```bash
cd frontend
npm install
npm run dev
```

### Environment variables (`backend/.env`)
| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | yes | AI notes, quizzes and chat |
| `SECRET_KEY` | recommended | Signs login tokens |
| `EXTRA_ORIGINS` | no | Extra comma-separated CORS origins |

## GitHub Pages
Every push to `main` deploys the **frontend** to GitHub Pages (`.github/workflows/pages.yml`).
Pages only hosts static files, so the backend must run somewhere else:
- **Default:** the Pages site talks to a backend running on your own machine (`http://127.0.0.1:8000`). Start the backend first.
- **Hosted backend:** set a repository variable `VITE_API_URL` (Settings → Secrets and variables → Actions → Variables) to its URL, and add the Pages URL to `EXTRA_ORIGINS`.

## Project structure
```
backend/   FastAPI app (routers, models, services)
frontend/  React + Vite app (pages, components, styles)
```
