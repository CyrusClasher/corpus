import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { Files, Type, Search, Timer } from "lucide-react";
import { FileTypeChart } from "@/components/dashboard/file-type-chart";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const [totalDocuments, indexedWordsAgg, totalSearches, avgSearchTimeAgg, uploadsByType, recentUploads] = await Promise.all([
    prisma.document.count({ where: { userId } }),
    prisma.document.aggregate({ where: { userId }, _sum: { wordCount: true } }),
    prisma.searchHistory.count({ where: { userId } }),
    prisma.searchHistory.aggregate({ where: { userId }, _avg: { elapsedMs: true } }),
    prisma.document.groupBy({ by: ["fileType"], where: { userId }, _count: { _all: true } }),
    prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
      take: 5,
      select: { id: true, title: true, fileType: true, uploadedAt: true },
    }),
  ]);

  const chartData = uploadsByType.map((u) => ({ fileType: u.fileType.toUpperCase(), count: u._count._all }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">A snapshot of your indexing and search activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Documents" value={totalDocuments} icon={Files} />
        <StatCard label="Indexed Words" value={(indexedWordsAgg._sum.wordCount ?? 0).toLocaleString()} icon={Type} />
        <StatCard label="Total Searches" value={totalSearches} icon={Search} />
        <StatCard label="Avg Search Time" value={`${Math.round(avgSearchTimeAgg._avg.elapsedMs ?? 0)}ms`} icon={Timer} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents by file type</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Upload documents to see this chart.</p>
            ) : (
              <FileTypeChart data={chartData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent uploads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUploads.length === 0 && <p className="text-sm text-muted-foreground">No uploads yet.</p>}
            {recentUploads.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{doc.title}</span>
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <Badge variant="muted" className="uppercase">{doc.fileType}</Badge>
                  <span>{formatRelativeDate(doc.uploadedAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
