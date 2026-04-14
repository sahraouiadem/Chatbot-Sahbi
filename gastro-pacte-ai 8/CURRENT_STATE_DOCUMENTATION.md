# Gastro-Pacte AI — Current State Documentation

_Generated on 2026-04-14 from repository analysis._

## 1) Executive Summary

Gastro-Pacte AI is currently a **frontend-first Vite + React application** with an accompanying `backend/` folder that acts as a **service-layer draft**, not a running HTTP server. The UI provides three core workflows:

1. Tunisian dialect chat assistant
2. Pre-consultation gastro form analysis
3. Doctor dictaphone transcription

AI features are implemented through direct usage of `@google/genai`. The data persistence layer is currently mocked with `localStorage`. A lightweight in-process RAG mechanism selects guideline text chunks from a local `.txt` file and injects them into prompts.

---

## 2) Repository Layout (Current)

```text
gastro-pacte-ai 8/
├── README.md
├── .gitignore
├── backend/
│   ├── README.md
│   ├── constants/
│   │   ├── models.ts
│   │   └── prompts.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── ragService.ts
│   │   └── storageService.ts
│   └── types/
│       └── raw-text.d.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── dist/
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── components/
        ├── pages/
        ├── services/
        ├── constants/
        ├── types/
        └── knowledge/
```

---

## 3) Technology Stack

### Frontend Runtime
- React `^19.2.4`
- React DOM `^19.2.4`
- Vite `^6.2.0`
- TypeScript `~5.8.2`
- Lucide React `^0.563.0`
- Google GenAI SDK `@google/genai ^1.39.0`

### Build and Config
- `vite` scripts: `dev`, `build`, `preview`
- Port configured to `3000`
- Vite alias: `@ -> ./src`
- Env key injection in Vite config for `process.env.API_KEY` and `process.env.GEMINI_API_KEY`

### Language & Typing
- TypeScript with `moduleResolution: bundler`
- Raw text module declarations for `*.txt` and `*.txt?raw`

---

## 4) Architecture Overview

## 4.1 Runtime Topology

**Today:**
- Browser app mounts from `frontend/src/main.tsx`
- App shell in `frontend/src/App.tsx` controls page switching via local state
- UI pages call service modules directly from frontend
- AI provider is called directly from client code
- Persistence writes to browser `localStorage`

**Important finding:** there is **no active backend server entrypoint** (`express`, `app.listen`, etc. are not present).

## 4.2 Logical Layers

1. **Presentation layer**
   - `frontend/src/components/*`
   - `frontend/src/pages/*`

2. **Application/service layer**
   - `frontend/src/services/aiService.ts`
   - `frontend/src/services/ragService.ts`
   - `frontend/src/services/storageService.ts`

3. **Domain constants**
   - `frontend/src/constants/models.ts`
   - `frontend/src/constants/prompts.ts`

4. **Type contracts**
   - `frontend/src/types/index.ts`
   - `frontend/src/types/env.d.ts`

5. **Knowledge source (RAG)**
   - `frontend/src/knowledge/chatbot-guidelines.txt`

6. **Backend mirror layer (not wired at runtime)**
   - `backend/services/*`, `backend/constants/*`

---

## 5) Frontend Structure and Behavior

## 5.1 Entry and Navigation
- `main.tsx` mounts `<App />` with `React.StrictMode`
- `App.tsx` keeps `currentPage: Page` state
- Navigation is handled by `Sidebar` callbacks, not URL routing
- No `react-router`; no deep links/back-forward history behavior

## 5.2 Pages

### A) `ChatPage.tsx`
Features:
- Landing experience before first user message
- Quick suggested questions (Tunisian Arabic)
- API health-check button
- Real-time chat message list
- Loading and error bubbles

Core calls:
- `sendChatMessage(userText, history)`
- `validateApiKeyHealth()`

### B) `FormPage.tsx`
Features:
- Multi-section clinical pre-consultation form
- French + Arabic/Tunisian language toggling
- AI-generated structured medical summary
- Persistence call after analysis

Core calls:
- `analyzeForm(formData)`
- `saveToHospitalServer(result, formData)`

### C) `DoctorPage.tsx`
Features:
- Microphone recording with `MediaRecorder`
- MIME fallback detection (`webm/mp4/ogg/wav`)
- Base64 conversion of recorded audio
- AI transcription result display and download

Core calls:
- `transcribeAudio(base64Audio, mimeType)`

## 5.3 Reusable Components
- `Button.tsx`: variant-based reusable button
- `InputField.tsx`: single-line / multiline field abstraction
- `Sidebar.tsx`: fixed navigation for 3 pages + status indicator

---

## 6) Service Layer (AI, RAG, Storage)

## 6.1 `aiService.ts`
Responsibilities:
- API key resolution from runtime env
- Google GenAI client creation
- Error normalization (quota/invalid key style handling)
- Chat generation
- Form analysis generation
- Audio transcription generation
- Optional rewrite pass to enforce Arabic-script-only assistant responses

Notable details:
- `sendChatMessage` includes:
  - latest conversation context
  - retrieved RAG guideline context
  - system prompt for Tunisian medical assistant behavior
- `analyzeForm` serializes form fields into a structured clinical prompt
- `transcribeAudio` sends inline binary audio + prompt to model

## 6.2 `ragService.ts`
Current retrieval approach:
- Loads text via raw import (`chatbot-guidelines.txt?raw`)
- Splits text into chunks by blank lines
- Tokenizes and scores chunks by lexical overlap
- Returns top-matching chunks (up to 3)

Characteristics:
- Simple and deterministic
- No embeddings/vector DB
- Suitable for small static knowledge; limited semantic quality at scale

## 6.3 `storageService.ts`
Current persistence behavior:
- Builds `MedicalRecord` object
- Appends to `localStorage` under key `pacte_medical_records`
- Provides retrieval via `getAllRecords()`
- Simulates network delay with 1-second timeout

Interpretation:
- This is a mock/offline persistence pattern, not a production data backend

---

## 7) Backend Folder State

The `backend/` folder contains near-mirror service modules for AI/RAG/storage plus constants and docs. It is documented as a **logic layer ready to extract into a real server**.

### Present
- `backend/services/aiService.ts`
- `backend/services/ragService.ts`
- `backend/services/storageService.ts`
- `backend/constants/{models.ts,prompts.ts}`

### Missing (for a real backend runtime)
- No server entrypoint (`server.ts`, `index.ts`, `app.ts` for HTTP)
- No route/controller definitions
- No middleware/auth/rate limiting
- No persistent DB adapter
- No deployment/runtime config for backend process

---

## 8) End-to-End Flow Traces

## 8.1 Chat Flow
1. User enters text in `ChatPage`
2. Page calls `sendChatMessage`
3. Service builds prompt + RAG context
4. `ai.models.generateContent` called with chat model
5. Optional rewrite pass enforces Arabic script
6. Response appended to UI messages

## 8.2 Pre-Consultation Flow
1. User fills fields in `FormPage`
2. `analyzeForm` called with complete `GastroFormData`
3. Structured medical summary generated by model
4. Result shown in UI
5. Record saved through `saveToHospitalServer` (`localStorage` mock)

## 8.3 Dictaphone Flow
1. User records audio in `DoctorPage`
2. Browser captures chunks via `MediaRecorder`
3. Blob converted to base64
4. `transcribeAudio` sends inlineData payload to model
5. Transcription rendered and downloadable as `.txt`

---

## 9) Data Model Snapshot

`frontend/src/types/index.ts` defines:
- `Page` enum: `WELCOME | FORM | DOCTOR`
- `ChatMessage`: `{ role, text, isError? }`
- `GastroFormData`: identity, symptom, digestive, warning signs, history fields
- `INITIAL_FORM_DATA`: empty defaults for all fields

Storage model (`storageService.ts`):
- `MedicalRecord`
  - `recordId`, `timestamp`
  - `patient` payload including full form details
  - `medicalResume`
  - static status/source metadata

---

## 10) Environment and Secrets

Observed env usage:
- `VITE_GEMINI_API_KEY`
- `GEMINI_API_KEY`
- `API_KEY`

`.gitignore` excludes:
- `node_modules`
- `.env`
- `.env.local`

Current behavior note:
- API key is resolved in frontend runtime and used by browser-side SDK calls.

---

## 11) Security, Reliability, and Scalability Assessment

### Security
1. **Client-side API key usage** is the major risk.
   - Browser-visible secret exposure possibility.
2. No auth boundaries for medical record operations (local only).

### Reliability
1. Error handling is present but primarily local/page scoped.
2. No centralized telemetry, alerting, or backend logs.
3. Network/provider failures are surfaced as user-facing strings.

### Scalability
1. RAG method is lexical chunk matching only.
2. No server-side orchestration/rate limiting.
3. `localStorage` persistence is non-shared and non-durable at organizational scale.

---

## 12) Duplication and Consistency Risks

There is significant duplication between:
- `frontend/src/services/*`
- `backend/services/*`

And between constants:
- `frontend/src/constants/*`
- `backend/constants/*`

Risk:
- Behavior drift over time if only one side is updated.

---

## 13) Gaps vs. Production-Ready System

To reach production-grade backend architecture, the project currently lacks:
- Real server process and endpoint contracts
- Server-side secret management for AI keys
- Authentication/authorization
- Durable persistence (DB or hospital API integration)
- Request auditing/compliance logging
- Tests (unit/integration/e2e)
- CI quality gates for regressions

---

## 14) Recommended Next Milestones (Prioritized)

1. **Create real backend API layer**
   - Move AI invocation server-side
   - Expose `/chat`, `/analyze`, `/transcribe` endpoints

2. **Replace localStorage persistence**
   - Implement secure backend write/read path
   - Integrate hospital endpoint or DB

3. **Eliminate duplicated service logic**
   - Define canonical source of truth (`backend` preferred)
   - Keep frontend thin and API-oriented

4. **Introduce observability and guardrails**
   - Central error logging and request tracing
   - Rate-limiting and input validation

5. **Add routing + test coverage**
   - Optional URL routing for better UX
   - Unit tests for RAG and service error handling

---

## 15) Source Files Reviewed

- `README.md`
- `.gitignore`
- `backend/README.md`
- `backend/constants/models.ts`
- `backend/constants/prompts.ts`
- `backend/services/aiService.ts`
- `backend/services/ragService.ts`
- `backend/services/storageService.ts`
- `backend/types/raw-text.d.ts`
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/pages/ChatPage.tsx`
- `frontend/src/pages/FormPage.tsx`
- `frontend/src/pages/DoctorPage.tsx`
- `frontend/src/components/Button.tsx`
- `frontend/src/components/InputField.tsx`
- `frontend/src/components/Sidebar.tsx`
- `frontend/src/services/aiService.ts`
- `frontend/src/services/ragService.ts`
- `frontend/src/services/storageService.ts`
- `frontend/src/constants/models.ts`
- `frontend/src/constants/prompts.ts`
- `frontend/src/types/index.ts`
- `frontend/src/types/env.d.ts`
- `frontend/src/types/raw-text.d.ts`
- `frontend/src/knowledge/chatbot-guidelines.txt`

---

## 16) Current-State Conclusion

The project is a well-structured prototype with clear domain separation in code (UI, services, prompts, RAG, storage), but operationally it still behaves as a **client-centric MVP**. The `backend/` folder reflects a strong intent to migrate to a true server architecture, yet that migration has not been executed yet. The next major step is to formalize server boundaries, secure secrets, and replace mock persistence with real backend infrastructure.
