"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Search } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import type { SearchHistoryItem } from "@/types";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<SearchHistoryItem[] | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.history));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recent Searches</h1>
        <p className="text-muted-foreground">Your last 20 queries. Click one to search it again.</p>
      </div>

      {history === null && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {history?.length === 0 && (
        <EmptyState icon={History} title="No searches yet" description="Run a search and it will show up here." />
      )}

      {history && history.length > 0 && (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/dashboard/search?q=${encodeURIComponent(item.query)}`)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{item.query}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.resultCount} result{item.resultCount === 1 ? "" : "s"} · {formatRelativeDate(new Date(item.searchedAt))}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
