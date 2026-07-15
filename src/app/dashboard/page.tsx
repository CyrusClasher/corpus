import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Search, Files, History, BookOpenText, Type, Timer } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;
  const name = session!.user?.name?.split(" ")[0] ?? "there";

  const [totalDocuments, indexedWordsAgg, totalSearches, avgSearchTimeAgg] = await Promise.all([
    prisma.document.count({ where: { userId } }),
    prisma.document.aggregate({ where: { userId }, _sum: { wordCount: true } }),
    prisma.searchHistory.count({ where: { userId } }),
    prisma.searchHistory.aggregate({ where: { userId }, _avg: { elapsedMs: true } }),
  ]);

  const stats = [
    { label: "Total Documents", value: totalDocuments, icon: Files },
    { label: "Total Indexed Words", value: (indexedWordsAgg._sum.wordCount ?? 0).toLocaleString(), icon: Type },
    { label: "Total Searches", value: totalSearches, icon: Search },
    { label: "Average Search Time", value: `${Math.round(avgSearchTimeAgg._avg.elapsedMs ?? 0)}ms`, icon: Timer },
  ];

  const shortcuts = [
    { href: "/dashboard/upload", title: "Upload Document", description: "Add a PDF, TXT, or Markdown file to your index.", icon: FileText },
    { href: "/dashboard/search", title: "Search Documents", description: "Run a keyword search across everything you've indexed.", icon: Search },
    { href: "/dashboard/documents", title: "My Documents", description: "Browse, view, and manage your uploaded files.", icon: BookOpenText },
    { href: "/dashboard/history", title: "Recent Searches", description: "Revisit and re-run your past queries.", icon: History },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {name}</h1>
        <p className="text-muted-foreground">Here's what's happening with your index.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
