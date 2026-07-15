"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentCard } from "@/components/dashboard/document-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";
import type { DocumentSummary } from "@/types";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/documents?page=${page}&pageSize=9`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Documents</h1>
        <p className="text-muted-foreground">Everything you've uploaded and indexed.</p>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {!loading && documents && documents.length === 0 && (
        <EmptyState
          icon={FolderOpen}
          title="No documents yet"
          description="Upload your first PDF, TXT, or Markdown file to start building your index."
          action={<Button variant="outline" onClick={() => router.push("/dashboard/upload")}>Upload a document</Button>}
        />
      )}

      {!loading && documents && documents.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDeleted={(id) => setDocuments((prev) => prev?.filter((d) => d.id !== id) ?? null)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
