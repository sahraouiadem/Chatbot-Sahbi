const NEXT_STEP_PATTERNS = [
  /شنو(?:ا|ّة)\s*نعم(?:ل|لو)?/u,
  /شنية\s*نعم(?:ل|لو)?/u,
  /اش\s*نعمل/u,
  /شنو(?:ا|ّة)\s*(?:الخطوة|الخطوات)\s*الجاية/u,
  /وقتاش\s*نمشي\s*ل(?:ل)?طبيب/u,
  /نحض(?:ر|ّر)\s*(?:شنو(?:ا|ّة)?|شنية|شني)/u,
  /اش\s*نحض(?:ر|ّر)/u,
  /next\s*step/i,
  /what\s*to\s*do/i,
  /what\s*(?:should|do)\s*i\s*do/i,
  /quoi\s*faire/i,
  /que\s*faire/i,
  /prochaine\s*[ée]tape/i,
  /documents?/i,
  /papiers?/i,
];

const normalize = (text: string): string => text.toLowerCase().replace(/\s+/g, ' ').trim();

export const isFormGuidanceRequested = (userText: string): boolean => {
  const normalized = normalize(userText);

  if (!normalized) {
    return false;
  }

  return NEXT_STEP_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const buildFormGuidanceHint = (userText: string): string => {
  if (!isFormGuidanceRequested(userText)) {
    return 'Form guidance: do not mention Pré-Consultation unless the user explicitly asks what to do next, what to prepare, or which documents are needed.';
  }

  return 'Form guidance: user asked for next steps/documents/what to do. If clinically appropriate and non-urgent, suggest Pré-Consultation once with brief rationale.';
};
