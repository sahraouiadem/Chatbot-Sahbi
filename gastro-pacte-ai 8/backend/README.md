# Backend — Service Layer

This folder contains the **logic layer** for the Gastro-Pacte AI application:
AI calls, data persistence, and domain constants.

## Structure

```
backend/
├── constants/
│   ├── models.ts        # Gemini model identifiers
│   └── prompts.ts       # All AI system prompts
└── services/
    ├── aiService.ts     # Gemini API wrappers (chat, form analysis, audio transcription)
    └── storageService.ts# Medical record persistence (localStorage → hospital server)
```

## Services

### `aiService.ts`
| Export | Description |
|--------|-------------|
| `sendChatMessage(text, history)` | Sends a message to the Tunisian-dialect chatbot |
| `analyzeForm(formData)` | Generates a structured medical observation from the pre-consultation form |
| `transcribeAudio(base64, mimeType)` | Transcribes a doctor's audio dictation verbatim |

### `storageService.ts`
| Export | Description |
|--------|-------------|
| `saveToHospitalServer(resume, patientData)` | Saves a medical record (currently localStorage; ready for real server) |
| `getAllRecords()` | Retrieves all saved records |

## Migrating to a Real Server

When you're ready to add a real Express/FastAPI backend:
1. Create a new server entrypoint (e.g., `backend/server.ts`)
2. Move the service functions to route handlers
3. Change `saveToHospitalServer` to use `fetch()` to your hospital endpoint
4. Update the frontend services to call your API instead of importing directly
