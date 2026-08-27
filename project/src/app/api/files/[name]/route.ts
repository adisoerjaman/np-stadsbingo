import { readFile } from "node:fs/promises";
import path from "node:path";

// Serveert lokaal opgeslagen uploads (alleen bij STORAGE_DRIVER=local).
// Auth wordt afgedwongen door de middleware: alleen ingelogde admins/teams.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  // Bescherming tegen path traversal: alleen een kale bestandsnaam toestaan.
  if (name.includes("/") || name.includes("\\") || name.includes("..")) {
    return new Response("Bad request", { status: 400 });
  }

  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
