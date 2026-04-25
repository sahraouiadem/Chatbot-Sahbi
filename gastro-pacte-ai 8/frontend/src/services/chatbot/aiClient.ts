import { GoogleGenAI } from '@google/genai';

const resolveApiKey = (): string => {
  const injectedProcessApiKey =
    typeof process !== 'undefined'
      ? process.env.GEMINI_API_KEY || process.env.API_KEY || ''
      : '';

  const key =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    injectedProcessApiKey ||
    '';

  if (!key.trim()) {
    throw new Error(
      'Clé API Gemini introuvable. Définis VITE_GEMINI_API_KEY (ou GEMINI_API_KEY) dans frontend/.env.local puis redémarre le serveur Vite.'
    );
  }

  return key;
};

export const extractErrorMessage = (error: unknown): string => {
  const simplifyProviderMessage = (raw: string): string => {
    const lowered = raw.toLowerCase();

    if (lowered.includes('api key expired') || lowered.includes('api_key_invalid')) {
      return 'Clé API Gemini expirée ou invalide. Génère une nouvelle clé dans Google AI Studio, remplace-la dans frontend/.env.local, puis redémarre `npm run dev`.';
    }

    if (lowered.includes('quota') || lowered.includes('rate') || lowered.includes('resource_exhausted')) {
      return 'Quota API atteint. Vérifie la facturation/limites du projet Google AI puis réessaie.';
    }

    if (raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(raw) as { error?: { message?: string } };
        const providerMessage = parsed.error?.message;
        if (providerMessage && providerMessage.trim()) {
          return simplifyProviderMessage(providerMessage);
        }
      } catch {
        return raw;
      }
    }

    return raw;
  };

  if (error instanceof Error && error.message.trim()) {
    return simplifyProviderMessage(error.message);
  }

  return 'Erreur AI inconnue';
};

export const createAiClient = (): GoogleGenAI => new GoogleGenAI({ apiKey: resolveApiKey() });
