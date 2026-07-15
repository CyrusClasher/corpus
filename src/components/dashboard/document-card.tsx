"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Eye, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatBytes, formatRelativeDate } from "@/lib/utils";
import type { DocumentSummary } from "@/types";

export function DocumentCard({ document, onDeleted }: { document: DocumentSummary; onDeleted: (id: string) => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/document/${document.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted(document.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/10">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{document.title}</p>
              <p className="truncate text-xs text-muted-foreground">{document.filename}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="muted" className="uppercase">{document.fileType}</Badge>
            <span>{formatBytes(document.fileSize)}</span>
            <span>·</span>
            <span>{document.wordCount.toLocaleString()} words</span>
            <span>·</span>
            <span>{formatRelativeDate(new Date(document.uploadedAt))}</span>
          </div>

          <div className="mt-auto flex gap-2 pt-2">
            <Link
              href={`/dashboard/documents/${document.id}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-input py-2 text-sm font-medium hover:bg-muted"
            >
              <Eye className="h-4 w-4" /> View
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this document?"
        description={`This permanently removes "${document.title}", its uploaded file, and every indexed word. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
