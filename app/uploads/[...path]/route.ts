import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/** Solo nombres planos de archivo con extensión conocida: sin traversal. */
const SAFE_FILENAME = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif|svg)$/;

/**
 * GET /uploads/<archivo> — sirve las imágenes desde ./uploads con caché
 * inmutable (nada se escribe en public/ en runtime).
 */
export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await ctx.params;

  if (parts.length !== 1) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const filename = parts[0]!;
  if (!SAFE_FILENAME.test(filename)) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, filename);
  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const mime = MIME_BY_EXT[ext] ?? "application/octet-stream";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Los SVG (solo de la semilla) se sirven sin capacidades peligrosas.
      ...(ext === ".svg"
        ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" }
        : {}),
    },
  });
}
