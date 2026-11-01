// Reading time (SPEC Stage 3 task 6): words / 230, rounded up, at least 1 minute.
export const WORDS_PER_MINUTE = 230;

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export function readingTime(text: string): number {
  return Math.max(1, Math.ceil(countWords(text) / WORDS_PER_MINUTE));
}
