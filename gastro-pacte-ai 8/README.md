# Gastro-Pacte AI

> AI-powered pre-consultation assistant for gastroenterology, built with React + Gemini.

## Project Structure

```
gastro-pacte-ai/
├── frontend/          ← Vite + React application
│   ├── src/
│   │   ├── App.tsx          # Root component (routing only)
│   │   ├── main.tsx         # Entry point
│   │   ├── types/           # Shared TypeScript types
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── InputField.tsx
│   │   │   └── Sidebar.tsx
│   │   └── pages/           # One file per route
│   │       ├── ChatPage.tsx     # Tunisian dialect chatbot
│   │       ├── FormPage.tsx     # Pre-consultation form
│   │       └── DoctorPage.tsx   # Doctor dictaphone
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.local       # ← GEMINI_API_KEY goes here
│
└── backend/           ← AI service layer (ready to extract to a real server)
    ├── constants/
    │   ├── models.ts        # Gemini model identifiers
    │   └── prompts.ts       # All AI system prompts
    └── services/
        ├── aiService.ts     # sendChatMessage / analyzeForm / transcribeAudio
        └── storageService.ts# saveToHospitalServer / getAllRecords
```

## Getting Started

```bash
cd frontend
npm install
npm run dev       # → http://localhost:3000
```

## Features

| Page | Description |
|------|-------------|
| **Chatbot Tunisien** | Tunisian-dialect symptom chatbot powered by Gemini |
| **Pré-Consultation** | Structured gastro form → AI medical observation |
| **Espace Docteur** | Voice recording → verbatim transcription |

## Environment Variables

Create `frontend/.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Docker

The repository can be run in Docker using a production-grade frontend image (multi-stage build + nginx).

### 1) Set environment variable for build-time injection

Create a `.env` file at the repository root (next to `docker-compose.yml`) or export the variable in your shell:

```bash
cp .env.example .env
# then edit .env and set GEMINI_API_KEY
```

### 2) Build and start

```bash
docker compose up --build -d
```

App URL:
- `http://localhost:3000`

### 3) Stop

```bash
docker compose down
```

### Notes
- The current `backend/` folder is a service layer and does not expose an HTTP server yet, so only the frontend service is containerized at this stage.
- The Gemini key is currently consumed at **frontend build time** (Vite env behavior).
