const TITLE_MATCH_POINTS = 20;
const BODY_MATCH_POINTS = 5;
const FREQUENCY_BONUS_PER_OCCURRENCE = 1;
const RECENT_UPLOAD_BONUS = 3;
const RECENT_UPLOAD_WINDOW_DAYS = 7;

export interface RankingInput {
  title: string;
  matchedFrequencies: Record<string, number>;
  uploadedAt: Date;
}

export function scoreDocument(
  queryTokens: string[],
  doc: RankingInput,
): number {
  let score = 0;
  const titleLower = doc.title.toLowerCase();
  const isRecent =
    Date.now() - doc.uploadedAt.getTime() <
    RECENT_UPLOAD_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  for (const token of queryTokens) {
    const frequency = doc.matchedFrequencies[token] ?? 0;
    if (frequency === 0) continue;

    if (titleLower.includes(token)) {
      score += TITLE_MATCH_POINTS;
    }
    score += BODY_MATCH_POINTS;
    score += (frequency - 1) * FREQUENCY_BONUS_PER_OCCURRENCE; // 1st occurrence already counted by BODY_MATCH_POINTS
  }

  if (isRecent) {
    score += RECENT_UPLOAD_BONUS;
  }

  return score;
}
