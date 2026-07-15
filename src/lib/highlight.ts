export function highlightText(text: string, words: string[]): string {
  if (words.length === 0) return escapeHtml(text);

  const escapedWords = words
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length); // longest first avoids partial overlaps
  const pattern = new RegExp(`\\b(${escapedWords.join("|")})\\w*`, "gi");

  return escapeHtml(text).replace(pattern, (match) => `<mark>${match}</mark>`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
