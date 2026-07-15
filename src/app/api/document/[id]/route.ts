import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { deleteFile } from "@/lib/storage";
import { documentIdSchema } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await requireUserId();
    const { id } = documentIdSchema.parse(params);

    const document = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      throw new ApiError(404, "Document not found.");
    }

    return Response.json({ document });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await requireUserId();
    const { id } = documentIdSchema.parse(params);

    const document = await prisma.document.findFirst({ where: { id, userId } });
    if (!document) {
      throw new ApiError(404, "Document not found.");
    }

    await deleteFile(document.path);
    await prisma.token.deleteMany({ where: { documentId: id } });
    await prisma.document.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
