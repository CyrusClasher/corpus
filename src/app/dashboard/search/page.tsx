"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/dashboard/search-bar";
import { SearchResultCard } from "@/components/dashboard/search-result-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { highlightText } from "@/lib/highlight";
import { SearchX, FileSearch } from "lucide-react";
import type { SearchResultItem } from "@/types";

const FILE_TYPES = [
  { value: undefined, label: "All types" },
  { value: "pdf", label: "PDF" },
  { value: "txt", label: "TXT" },
  { value: "md", label: "Markdown" },
] as const;

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [fileType, setFileType] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(q: string, type = fileType) {
    setQuery(q);
    setLoading(true);
    setError(null);
    router.replace(`/dashboard/search?q=${encodeURIComponent(q)}`);
    try {
      const params = new URLSearchParams({ q });
      if (type) params.set("fileType", type);
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results);
      setElapsedMs(data.elapsedMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(documentId: string) {
    await fetch(`/api/document/${documentId}`, { method: "DELETE" });
    setResults((prev) => prev?.filter((r) => r.documentId !== documentId) ?? null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search your documents</h1>
        <p className="text-muted-foreground">Query the inverted index — every word you've uploaded is searchable.</p>
      </div>

      <SearchBar initialQuery={initialQuery} onSearch={(q) => runSearch(q)} />

      <div className="flex flex-wrap items-center gap-2">
        {FILE_TYPES.map((t) => (
          <button key={t.label} onClick={() => { setFileType(t.value); if (query) runSearch(query, t.value); }}>
            <Badge variant={fileType === t.value ? "accent" : "outline"} className="cursor-pointer">
              {t.label}
            </Badge>
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState icon={SearchX} title="Search failed" description={error} />
      )}

      {!loading && !error && results && (
        <>
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"} for "{query}"
            {elapsedMs !== null && <> · {elapsedMs}ms</>}
          </p>
          {results.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="No matches found"
              description="Try a different keyword, or check that you've uploaded a document containing it."
            />
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <SearchResultCard
                  key={r.documentId}
                  result={r}
                  highlightedSnippet={highlightText(r.snippet, r.matchedWords)}
                  onDelete={() => handleDelete(r.documentId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !results && !error && (
        <EmptyState
          icon={FileSearch}
          title="Nothing searched yet"
          description="Type a keyword above to search across every document you've uploaded."
          action={
            <Button variant="outline" onClick={() => router.push("/dashboard/upload")}>
              Upload a document
            </Button>
          }
        />
      )}
    </div>
  );
}
