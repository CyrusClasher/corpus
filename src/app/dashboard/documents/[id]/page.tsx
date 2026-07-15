import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatRelativeDate } from "@/lib/utils";
import { DocumentViewerSearch } from "@/components/dashboard/document-viewer-search";

export default async function DocumentViewerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  // Authorization: findFirst scoped to the session's userId, not just the
  // id from the URL — this is what stops a user from viewing someone
  // else's document by guessing/pasting a different id into the URL bar.
  const document = await prisma.document.findFirst({ where: { id: params.id, userId } });
  if (!document) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{document.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="muted" className="uppercase">{document.fileType}</Badge>
          <span>{formatBytes(document.fileSize)}</span>
          <span>·</span>
          <span>{document.wordCount.toLocaleString()} words</span>
          <span>·</span>
          <span>Uploaded {formatRelativeDate(document.uploadedAt)}</span>
        </div>
      </div>

      <DocumentViewerSearch content={document.content} />
    </div>
  );
}
