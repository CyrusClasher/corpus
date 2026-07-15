import { cleanText, normalizeWord } from "./textCleaning";
import { STOP_WORDS } from "./stopwords";

export function tokenize(rawText: string): string[] {
  const cleaned = cleanText(rawText);
  if (!cleaned) return [];

  return (
    cleaned
      .split(" ")
      .filter(Boolean)
      // Drop single characters ("a", "s" left over from stripped punctuation)
      .filter((word) => word.length > 1)
      .filter((word) => !STOP_WORDS.has(word))
      .map(normalizeWord)
  );
}

export function computeTermFrequencies(
  tokens: string[],
): Record<string, number> {
  const frequencies: Record<string, number> = Object.create(null);
  for (const token of tokens) {
    frequencies[token] = (frequencies[token] ?? 0) + 1;
  }
  return frequencies;
}
