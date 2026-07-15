"use client";

import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/dashboard/upload-dropzone";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload a document</h1>
        <p className="text-muted-foreground">PDF, TXT, and Markdown files up to 20MB.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <UploadDropzone onUploaded={() => router.refresh()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What happens after you upload</CardTitle>
          <CardDescription>Every file runs through the same pipeline before it's searchable.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-4">
          {["Store file", "Extract text", "Tokenize", "Build index"].map((step, i) => (
            <div key={step} className="rounded-md border border-border p-3 text-center">
              <span className="mb-1 block text-xs font-semibold text-accent">{i + 1}</span>
              {step}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
