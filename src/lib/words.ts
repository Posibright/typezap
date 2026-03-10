// lib/words.ts

export const MODES = ['time', 'words'] as const;
export type Mode = (typeof MODES)[number];

export const TIME_OPTIONS = [15, 30, 60, 120] as const;
export type TimeOption = (typeof TIME_OPTIONS)[number];

export const WORD_COUNT_OPTIONS = [10, 25, 50, 100] as const;
export type WordCountOption = (typeof WORD_COUNT_OPTIONS)[number];

// ── Fallback word pool (used when API is unreachable) ──────────────────
const FALLBACK_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need',
  'large', 'often', 'hand', 'high', 'place', 'hold', 'free', 'real',
  'life', 'few', 'north', 'open', 'seem', 'together', 'next', 'white',
  'children', 'begin', 'got', 'walk', 'example', 'ease', 'paper', 'group',
  'always', 'music', 'those', 'both', 'mark', 'book', 'letter', 'until',
  'mile', 'river', 'car', 'feet', 'care', 'second', 'enough', 'plain',
  'girl', 'usual', 'young', 'ready', 'above', 'ever', 'red', 'list',
  'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family',
  'direct', 'pose', 'leave', 'song', 'measure', 'door', 'product', 'black',
  'short', 'numeral', 'class', 'wind', 'question', 'happen', 'complete',
  'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem',
  'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king',
  'space', 'heard', 'best', 'hour', 'better', 'true', 'during', 'hundred',
  'five', 'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest',
];

/** Generate words from fallback list (offline / error case) */
export function generateFallbackWords(count: number): string[] {
  const shuffled = [...FALLBACK_WORDS].sort(() => Math.random() - 0.5);
  const result: string[] = [];
  while (result.length < count) {
    result.push(...shuffled);
  }
  return result.slice(0, count);
}

/** Fetch quotes from our API route and split into words */
export async function fetchQuoteWords(): Promise<{
  words: string[];
  rawQuotes: string[];
  source: string;
}> {
  try {
    const res = await fetch('/api/quotes');
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    const quotes: string[] = data.quotes;
    const source: string = data.source;

    // Combine all quotes into one long word array
    const allWords = quotes
      .join(' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 0)
      // Normalize: lowercase, strip trailing punctuation except apostrophes
      .map((w: string) => w.toLowerCase());

    return { words: allWords, rawQuotes: quotes, source };
  } catch {
    // Fallback
    const words = generateFallbackWords(200);
    return { words, rawQuotes: [], source: 'fallback' };
  }
}

export function calculateWPM(charsTyped: number, elapsedSeconds: number): number {
  if (elapsedSeconds === 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(charsTyped / 5 / minutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}