import { GoogleGenAI } from '@google/genai';
import { MODEL_CHAT } from '../../constants/models';

const ARABIC_SCRIPT_REPLY_REGEX =
  /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\n\r.,;:!?،؛؟()\-"'«»…]+$/u;

const isArabicScriptReply = (text: string): boolean => {
  const normalized = text.trim();
  return normalized.length > 0 && ARABIC_SCRIPT_REPLY_REGEX.test(normalized);
};

export const enforceArabicScriptReply = async (ai: GoogleGenAI, rawReply: string): Promise<string> => {
  if (isArabicScriptReply(rawReply)) {
    return rawReply;
  }

  const rewritePrompt = `حوّل النص التالي لنفس المعنى بالدارجة التونسية فقط وبالحروف العربية فقط.
- ممنوع استعمال الحروف اللاتينية.
- ممنوع استعمال أرقام الأرابيزي كيما 3 و7 و9.
- رجّع غير النص النهائي بدون شرح.

النص:
${rawReply}`;

  const rewriteResponse = await ai.models.generateContent({
    model: MODEL_CHAT,
    contents: rewritePrompt,
  });

  const rewritten = (rewriteResponse.text || '').trim();
  if (isArabicScriptReply(rewritten)) {
    return rewritten;
  }

  return rawReply;
};
