import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { searchDocuments } from "@/lib/search";
import { searchQuerySchema } from "@/lib/validation";
import { errorResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const startedAt = performance.now();
  try {
    const userId = await requireUserId();

    const { searchParams } = new URL(req.url);
    const { q, fileType } = searchQuerySchema.parse({
      q: searchParams.get("q") ?? "",
      fileType: searchParams.get("fileType") ?? undefined,
    });

    let results = await searchDocuments(userId, q);
    if (fileType) {
      results = results.filter((r) => r.fileType === fileType);
    }

    const elapsedMs = Math.round(performance.now() - startedAt);

    await prisma.searchHistory.create({
      data: { query: q, resultCount: results.length, elapsedMs, userId },
    });

    return Response.json({ results, query: q, elapsedMs });
  } catch (error) {
    return errorResponse(error);
  }
}
