import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const userId = await requireUserId();

    const [
      totalDocuments,
      indexedWordsAgg,
      totalSearches,
      avgSearchTimeAgg,
      uploadsByType,
      recentUploads,
    ] = await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.document.aggregate({
        where: { userId },
        _sum: { wordCount: true },
      }),
      prisma.searchHistory.count({ where: { userId } }),
      prisma.searchHistory.aggregate({
        where: { userId },
        _avg: { elapsedMs: true },
      }),
      prisma.document.groupBy({
        by: ["fileType"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.document.findMany({
        where: { userId },
        orderBy: { uploadedAt: "desc" },
        take: 5,
        select: { id: true, title: true, fileType: true, uploadedAt: true },
      }),
    ]);

    const avgSearchTimeMs = Math.round(avgSearchTimeAgg._avg.elapsedMs ?? 0);

    return Response.json({
      totalDocuments,
      totalIndexedWords: indexedWordsAgg._sum.wordCount ?? 0,
      totalSearches,
      avgSearchTimeMs,
      uploadsByType: uploadsByType.map((u) => ({
        fileType: u.fileType,
        count: u._count._all,
      })),
      recentUploads,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
