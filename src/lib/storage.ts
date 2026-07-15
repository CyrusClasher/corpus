import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";

export async function saveFile(
  buffer: Buffer,
  originalFilename: string,
): Promise<{ path: string; storedFilename: string }> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(originalFilename);
  const storedFilename = `${randomUUID()}${ext}`;
  const fullPath = path.join(UPLOAD_DIR, storedFilename);

  await writeFile(fullPath, buffer);

  return { path: fullPath, storedFilename };
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {}
}
