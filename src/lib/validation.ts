import { z } from "zod";

export const SUPPORTED_FILE_TYPES = ["pdf", "txt", "md"] as const;
export const MAX_UPLOAD_SIZE_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_MB ?? 20) * 1024 * 1024;

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Search query cannot be empty")
    .max(200, "Search query is too long"),
  fileType: z.enum(SUPPORTED_FILE_TYPES).optional(),
});

export const documentIdSchema = z.object({
  id: z.string().cuid("Invalid document id"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const uploadMetaSchema = z.object({
  filename: z.string().min(1).max(255),
  fileType: z.enum(SUPPORTED_FILE_TYPES, {
    errorMap: () => ({
      message: "Only PDF, TXT, and Markdown files are supported",
    }),
  }),
  fileSize: z
    .number()
    .positive()
    .max(
      MAX_UPLOAD_SIZE_BYTES,
      `File exceeds the ${process.env.MAX_UPLOAD_SIZE_MB ?? 20}MB limit`,
    ),
});
