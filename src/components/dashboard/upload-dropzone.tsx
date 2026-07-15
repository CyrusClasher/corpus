"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Stage =
  | "idle"
  | "uploading"
  | "extracting"
  | "indexing"
  | "done"
  | "error";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  uploading: "Storing file…",
  extracting: "Extracting text…",
  indexing: "Building inverted index…",
  done: "Ready to search",
  error: "Upload failed",
};

const ACCEPTED = [".pdf", ".txt", ".md", ".markdown"];
const MAX_SIZE_MB = 20;

export function UploadDropzone({ onUploaded }: { onUploaded?: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        toast({
          title: "Unsupported file type",
          description: "Please upload a PDF, TXT, or Markdown file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum size is ${MAX_SIZE_MB}MB.`,
          variant: "destructive",
        });
        return;
      }

      setFileName(file.name);
      setStage("uploading");
      setProgress(20);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const progressTimer = setInterval(() => {
          setProgress((p) => Math.min(p + 15, 85));
        }, 300);
        setTimeout(() => setStage("extracting"), 400);
        setTimeout(() => setStage("indexing"), 900);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        clearInterval(progressTimer);

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");

        setProgress(100);
        setStage("done");
        toast({
          title: "Document indexed",
          description: `${file.name} is ready to search.`,
          variant: "success",
        });
        onUploaded?.();
      } catch (err) {
        setStage("error");
        toast({
          title: "Upload failed",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setTimeout(() => {
          setStage("idle");
          setProgress(0);
          setFileName(null);
        }, 2200);
      }
    },
    [onUploaded],
  );

  const isBusy = stage !== "idle" && stage !== "error" && stage !== "done";

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) upload(file);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center transition-colors",
        isDragging ? "border-accent bg-accent/5" : "border-border",
        isBusy && "pointer-events-none opacity-80",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />

      {stage === "idle" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <UploadCloud className="h-7 w-7 text-accent" />
          </div>
          <div>
            <p className="font-medium">Drag and drop a document here</p>
            <p className="text-sm text-muted-foreground">
              PDF, TXT, or Markdown — up to {MAX_SIZE_MB}MB
            </p>
          </div>
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
        </>
      )}

      {isBusy && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <div className="w-full max-w-xs space-y-2">
            <p className="text-sm font-medium">{STAGE_LABEL[stage]}</p>
            <p className="truncate text-xs text-muted-foreground">{fileName}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </>
      )}

      {stage === "done" && (
        <>
          <CheckCircle2 className="h-8 w-8 text-accent" />
          <div>
            <p className="font-medium">Indexed successfully</p>
            <p className="truncate text-xs text-muted-foreground">{fileName}</p>
          </div>
        </>
      )}

      {stage === "error" && (
        <>
          <FileText className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Something went wrong. Try again.
          </p>
        </>
      )}
    </div>
  );
}
