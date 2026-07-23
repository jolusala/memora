import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
}

async function ensureUploadDir(): Promise<string> {
  const dir = getUploadDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export class UploadError extends Error {}

export async function saveUploadedFile(
  file: File
): Promise<{ filename: string; originalName: string }> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError("Formato de imagen no soportado. Usa JPG, PNG, WEBP o GIF.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError("La imagen supera el tamaño máximo de 15MB.");
  }

  const dir = await ensureUploadDir();
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return { filename, originalName: file.name };
}

export async function deleteUploadedFile(filename: string): Promise<void> {
  const dir = path.resolve(getUploadDir());
  const target = path.resolve(dir, path.basename(filename));
  if (path.dirname(target) !== dir) return; // path traversal guard
  await fs.unlink(target).catch(() => undefined);
}

export function contentTypeForFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
