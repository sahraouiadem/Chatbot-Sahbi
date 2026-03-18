import knowledgeBaseText from '../../frontend/src/knowledge/chatbot-guidelines.txt?raw';

interface ChunkScore {
  chunk: string;
  score: number;
}

const MAX_CHUNKS = 3;
const MIN_SCORE = 1;

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text: string): string[] => normalize(text).split(' ').filter(Boolean);

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'are',
  'you',
  'your',
  'les',
  'des',
  'une',
  'pour',
  'dans',
  'sur',
  'est',
  'pas',
  'que',
  'qui',
  'quoi',
  'chnowa',
  'mta3',
  'fel',
  'fil',
  'w',
  'ou',
  'ya',
  'el',
  'l',
  '3la',
]);

const chunkKnowledgeBase = (rawText: string): string[] =>
  rawText
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 20);

const scoreChunk = (chunk: string, queryTokens: string[]): number => {
  const chunkTokens = new Set(tokenize(chunk));
  return queryTokens.reduce((score, token) => (chunkTokens.has(token) ? score + 1 : score), 0);
};

const chunks = chunkKnowledgeBase(knowledgeBaseText);

export const retrieveGuidelineContext = (query: string): string => {
  const queryTokens = tokenize(query).filter((token) => token.length > 2 && !STOPWORDS.has(token));
  if (queryTokens.length === 0) {
    return chunks.slice(0, 2).join('\n\n');
  }

  const ranked: ChunkScore[] = chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, queryTokens) }))
    .filter((item) => item.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CHUNKS);

  if (ranked.length === 0) {
    return chunks.slice(0, 2).join('\n\n');
  }

  return ranked.map((item) => item.chunk).join('\n\n');
};
