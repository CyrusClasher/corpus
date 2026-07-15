import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { saveFile } from "@/lib/storage";
import { detectFileType, extractText } from "@/lib/textExtraction";
import { buildAndStoreIndex } from "@/lib/invertedIndex";
import { uploadMetaSchema } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "No file was uploaded.");
    }

    const fileType = detectFileType(file.name);
    if (!fileType) {
      throw new ApiError(
        400,
        "Unsupported file type. Please upload a PDF, TXT, or Markdown file.",
      );
    }

    uploadMetaSchema.parse({
      filename: file.name,
      fileType,
      fileSize: file.size,
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    const { path: storedPath } = await saveFile(buffer, file.name);

    const rawText = await extractText(buffer, fileType);
    if (!rawText.trim()) {
      throw new ApiError(
        422,
        "No readable text could be extracted from this file.",
      );
    }

    const title = file.name.replace(/\.[^/.]+$/, "");
    const document = await prisma.document.create({
      data: {
        title,
        filename: file.name,
        path: storedPath,
        fileType,
        fileSize: file.size,
        content: rawText,
        userId,
      },
    });

    const wordCount = await buildAndStoreIndex(document.id, rawText);

    await prisma.document.update({
      where: { id: document.id },
      data: { wordCount },
    });
    return Response.json(
      {
        document: {
          id: document.id,
          title: document.title,
          fileType: document.fileType,
          fileSize: document.fileSize,
          wordCount,
          uploadedAt: document.uploadedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
