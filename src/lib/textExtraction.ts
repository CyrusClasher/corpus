export async function extractFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text;
}
export function extractFromTxt(buffer: Buffer): string {
  return buffer.toString("utf-8");
}
export function extractFromMarkdown(buffer: Buffer): string {
  const raw = buffer.toString("utf-8");
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\|/g, " ")
    .replace(/-{3,}/g, " ");
}

export type SupportedFileType = "pdf" | "txt" | "md";

export function detectFileType(filename: string): SupportedFileType | null {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (ext === "txt") return "txt";
  if (ext === "md" || ext === "markdown") return "md";
  return null;
}

export async function extractText(
  buffer: Buffer,
  fileType: SupportedFileType,
): Promise<string> {
  switch (fileType) {
    case "pdf":
      return extractFromPdf(buffer);
    case "txt":
      return extractFromTxt(buffer);
    case "md":
      return extractFromMarkdown(buffer);
  }
}
