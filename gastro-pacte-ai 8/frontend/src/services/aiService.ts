import { GenerateContentResponse } from '@google/genai';
import { MODEL_CHAT, MODEL_ANALYSIS, MODEL_AUDIO } from '../constants/models';
import {
  DOCTOR_TRANSCRIPTION_PROMPT,
  FORM_ANALYSIS_PROMPT,
} from '../constants/prompts';
import { ChatMessage, GastroFormData } from '../types';
import { createAiClient, extractErrorMessage } from './chatbot/aiClient';
import { enforceArabicScriptReply } from './chatbot/replyPolicy';
import { buildChatPrompt } from './chatbot/promptComposer';

export const validateApiKeyHealth = async (): Promise<{ ok: boolean; message: string }> => {
  try {
    const ai = createAiClient();

    await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: 'Health check: reply with OK only.',
    });

    return {
      ok: true,
      message: 'Connexion Gemini OK.',
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
};

export const sendChatMessage = async (userText: string, history: ChatMessage[]): Promise<string> => {
  try {
    const ai = createAiClient();
    const prompt = buildChatPrompt(userText, history);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: prompt,
    });

    const rawReply = (response.text || '').trim();
    if (!rawReply) {
      return 'سامحني، صارت مشكلة تقنية.';
    }

    return await enforceArabicScriptReply(ai, rawReply);
  } catch (error) {
    throw new Error(`Chat indisponible: ${extractErrorMessage(error)}`);
  }
};

export const analyzeForm = async (formData: GastroFormData): Promise<string> => {
  try {
    const ai = createAiClient();
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

    return response.text || 'Aucune analyse générée.';
  } catch (error) {
    throw new Error(`Analyse indisponible: ${extractErrorMessage(error)}`);
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const ai = createAiClient();

    const response = await ai.models.generateContent({
      model: MODEL_AUDIO,
      contents: [
        { inlineData: { mimeType, data: base64Audio } },
        { text: DOCTOR_TRANSCRIPTION_PROMPT },
      ],
    });

    return response.text || 'Transcription vide — l\'audio ne contenait pas de parole détectable.';
  } catch (error) {
    throw new Error(`Transcription indisponible: ${extractErrorMessage(error)}`);
  }
};
