import { prisma } from "./prisma";
import { tokenize } from "./tokenizer";
import { scoreDocument } from "./ranking";

export interface SearchResult {
  documentId: string;
  title: string;
  fileType: string;
  uploadedAt: Date;
  wordCount: number;
  score: number;
  snippet: string;
  matchedWords: string[];
}

export async function searchDocuments(
  userId: string,
  rawQuery: string,
): Promise<SearchResult[]> {
  const queryTokens = Array.from(new Set(tokenize(rawQuery)));
  if (queryTokens.length === 0) return [];
  const matchingTokens = await prisma.token.findMany({
    where: {
      word: { in: queryTokens },
      document: { userId },
    },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          fileType: true,
          uploadedAt: true,
          wordCount: true,
          content: true,
        },
      },
    },
  });

  const byDocument = new Map<
    string,
    {
      title: string;
      fileType: string;
      uploadedAt: Date;
      wordCount: number;
      content: string;
      frequencies: Record<string, number>;
    }
  >();

  for (const tokenRow of matchingTokens) {
    const doc = tokenRow.document;
    if (!byDocument.has(doc.id)) {
      byDocument.set(doc.id, {
        title: doc.title,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt,
        wordCount: doc.wordCount,
        content: doc.content,
        frequencies: {},
      });
    }
    byDocument.get(doc.id)!.frequencies[tokenRow.word] = tokenRow.frequency;
  }

  const results: SearchResult[] = Array.from(byDocument.entries()).map(
    ([documentId, doc]) => {
      const score = scoreDocument(queryTokens, {
        title: doc.title,
        matchedFrequencies: doc.frequencies,
        uploadedAt: doc.uploadedAt,
      });

      return {
        documentId,
        title: doc.title,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt,
        wordCount: doc.wordCount,
        score,
        snippet: buildSnippet(doc.content, Object.keys(doc.frequencies)),
        matchedWords: Object.keys(doc.frequencies),
      };
    },
  );

  results.sort((a, b) => b.score - a.score);
  return results;
}

function buildSnippet(
  content: string,
  matchedWords: string[],
  radius = 100,
): string {
  const lowerContent = content.toLowerCase();
  let matchIndex = -1;

  for (const word of matchedWords) {
    const idx = lowerContent.indexOf(word);
    if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
      matchIndex = idx;
    }
  }

  if (matchIndex === -1) {
    return (
      content.slice(0, radius * 2).trim() +
      (content.length > radius * 2 ? "…" : "")
    );
  }

  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(content.length, matchIndex + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < content.length ? "…" : "";
  return prefix + content.slice(start, end).trim() + suffix;
}
