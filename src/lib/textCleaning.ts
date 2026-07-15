export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function removePunctuation(text: string): string {
  return text.replace(/[.,/#!$%^&*;:{}=\-_`~()"'?<>[\]\\|+]/g, " ");
}

export function removeSpecialCharacters(text: string): string {
  return text.replace(/[^a-z0-9\s]/gi, " ");
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
export function normalizeWord(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 3 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss"))
    return word.slice(0, -1);
  return word;
}
export function cleanText(rawText: string): string {
  let text = toLowerCase(rawText);
  text = removePunctuation(text);
  text = removeSpecialCharacters(text);
  text = normalizeWhitespace(text);
  return text;
}
