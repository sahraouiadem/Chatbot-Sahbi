import { TUNISIAN_SYSTEM_PROMPT } from '../../constants/prompts';
import { ChatMessage } from '../../types';
import { retrieveGuidelineContext } from '../ragService';
import { buildFormGuidanceHint } from './formGuidancePolicy';

const toHistoryText = (history: ChatMessage[]): string =>
  history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.text}`)
    .join('\n');

export const buildChatPrompt = (userText: string, history: ChatMessage[]): string => {
  const historyText = toHistoryText(history);
  const ragContext = retrieveGuidelineContext(`${historyText}\n${userText}`);
  const formGuidanceHint = buildFormGuidanceHint(userText);

  return `${TUNISIAN_SYSTEM_PROMPT}

Contexte RAG (source de vérité des guidelines):
${ragContext}

Policy hint:
${formGuidanceHint}

Historique de la conversation:
${historyText}

Patient: ${userText}
Assistant:`;
};
