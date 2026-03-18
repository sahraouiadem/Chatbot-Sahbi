import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODEL_CHAT, MODEL_ANALYSIS, MODEL_AUDIO } from "../constants/models";
import {
  TUNISIAN_SYSTEM_PROMPT,
  DOCTOR_TRANSCRIPTION_PROMPT,
  FORM_ANALYSIS_PROMPT,
} from "../constants/prompts";
import { retrieveGuidelineContext } from "./ragService";
import { ChatMessage, GastroFormData } from "../../frontend/src/types";

// --- AI Client Factory ---
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Chat Service ---
export const sendChatMessage = async (
  userText: string,
  history: ChatMessage[]
): Promise<string> => {
  const ai = getAiClient();
  const historyText = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.text}`)
    .join("\n");

  const ragContext = retrieveGuidelineContext(`${historyText}\n${userText}`);

  const prompt = `${TUNISIAN_SYSTEM_PROMPT}

Contexte RAG (source de vérité des guidelines):
${ragContext}

Historique de la conversation:
${historyText}

Patient: ${userText}
Assistant:`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_CHAT,
    contents: prompt,
  });

  return response.text || "Samahni, ma fhemtekch (Erreur technique).";
};

// --- Form Analysis Service ---
export const analyzeForm = async (formData: GastroFormData): Promise<string> => {
  const ai = getAiClient();
  const prompt = `${FORM_ANALYSIS_PROMPT}
  
  --- 1. IDENTITÉ ---
  Nom: ${formData.fullName} | Âge: ${formData.age} | Sexe: ${formData.gender}

  --- 2. MOTIF ET DOULEUR ---
  Motif Principal: ${formData.motif}
  Durée: ${formData.duration}
  Intensité Douleur (0-10): ${formData.painIntensity}
  Type de Douleur: ${formData.painType} (ex: Brûlure, Crampe)
  Facteurs Déclenchants/Calmants: ${formData.painTrigger}

  --- 3. SIGNES DIGESTIFS ---
  Transit: ${formData.transit}
  Aspect des Selles: ${formData.stoolColor}
  Signes Hauts (Vomissements/Dysphagie): ${formData.upperDigestive}
  
  --- 4. SIGNES GÉNÉRAUX ---
  Perte de poids: ${formData.weightLoss}
  Fièvre/Frissons: ${formData.fever}
  
  --- 5. CONTEXTE ---
  Antécédents Personnels: ${formData.history}
  Antécédents Familiaux: ${formData.familyHistory}
  Traitements: ${formData.meds}
  Habitudes (Tabac/Alcool): ${formData.diet}
  
  INSTRUCTION: Rédige une "Observation Médicale" très structurée (Motif, HDM, Signes Fonctionnels, Signes Généraux, Terrain) en langage médical professionnel.`;

  const response = await ai.models.generateContent({
    model: MODEL_ANALYSIS,
    contents: prompt,
  });

  return response.text || "Aucune analyse générée.";
};

// --- Audio Transcription Service ---
export const transcribeAudio = async (
  base64Audio: string,
  mimeType: string
): Promise<string> => {
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: MODEL_AUDIO,
    contents: [
      { inlineData: { mimeType, data: base64Audio } },
      { text: DOCTOR_TRANSCRIPTION_PROMPT },
    ],
  });

  return (
    response.text ||
    "Transcription vide — l'audio ne contenait pas de parole détectable."
  );
};
