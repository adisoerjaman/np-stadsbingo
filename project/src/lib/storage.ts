import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

/**
 * Opslag-abstractie voor afbeeldingen. Foto's worden NIET meer als base64 in de
 * database opgeslagen, maar als bestand in object storage; de database bewaart
 * alleen de URL.
 *
 * Driver via env STORAGE_DRIVER:
 *   - "local" (default): schrijft naar ./uploads en serveert via /api/files/<naam>
 *     (handig voor lokale development; bestanden zijn auth-gated).
 *   - "vercel-blob": gebruikt Vercel Blob (productie). Vereist BLOB_READ_WRITE_TOKEN.
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

const driver = process.env.STORAGE_DRIVER ?? "local";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/** Valideert bestandstype en -grootte. Geeft een foutmelding terug, of null. */
export function validateImage(file: File): string | null {
  if (!(file.type in ALLOWED_TYPES)) {
    return "Alleen JPEG, PNG, WEBP of HEIC afbeeldingen zijn toegestaan";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Afbeelding mag maximaal 8 MB groot zijn";
  }
  return null;
}

/** Slaat een afbeelding op en geeft de URL terug die in de database komt. */
export async function uploadImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type] ?? "bin";
  const name = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (driver === "vercel-blob") {
    const blob = await put(`submissions/${name}`, buffer, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), buffer);
  return `/api/files/${name}`;
}

/** Verwijdert een eerder opgeslagen afbeelding (best-effort). */
export async function deleteImage(
  url: string | null | undefined,
): Promise<void> {
  if (!url || url.startsWith("data:")) return; // oude base64-rijen: niets te doen

  try {
    if (driver === "vercel-blob") {
      await del(url);
    } else if (url.startsWith("/api/files/")) {
      const name = path.basename(url);
      await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
    }
  } catch (error) {
    console.error("deleteImage error:", error);
  }
}
