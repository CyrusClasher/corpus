import Link from "next/link";
import { FileText, Eye, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import type { SearchResultItem } from "@/types";

export function SearchResultCard({
  result,
  highlightedSnippet,
  onDelete,
}: {
  result: SearchResultItem;
  highlightedSnippet: string;
  onDelete?: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Link
                href={`/dashboard/documents/${result.documentId}`}
                className="truncate font-medium hover:text-accent"
              >
                {result.title}
              </Link>
              <Badge variant="muted" className="uppercase">
                {result.fileType}
              </Badge>
            </div>
            <p
              className="text-sm leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
            />
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatRelativeDate(new Date(result.uploadedAt))}</span>
              <span>·</span>
              <span>{result.wordCount.toLocaleString()} words</span>
              <span>·</span>
              <Badge variant="accent">score {result.score}</Badge>
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Link
              href={`/dashboard/documents/${result.documentId}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="View document"
            >
              <Eye className="h-4 w-4" />
            </Link>
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
