import { prisma } from "./prisma";
import { computeTermFrequencies, tokenize } from "./tokenizer";

export async function buildAndStoreIndex(
  documentId: string,
  text: string,
): Promise<number> {
  const tokens = tokenize(text);
  const frequencies = computeTermFrequencies(tokens);

  const words = Object.keys(frequencies);
  if (words.length > 0) {
    await prisma.token.createMany({
      data: words.map((word) => ({
        documentId,
        word,
        frequency: frequencies[word],
      })),
      skipDuplicates: true,
    });
  }

  return tokens.length;
}

export async function removeFromIndex(documentId: string): Promise<void> {
  await prisma.token.deleteMany({ where: { documentId } });
}
