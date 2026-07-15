import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const userId = await requireUserId();

    const history = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: "desc" },
      take: 20,
      select: { id: true, query: true, resultCount: true, searchedAt: true },
    });

    return Response.json({ history });
  } catch (error) {
    return errorResponse(error);
  }
}
