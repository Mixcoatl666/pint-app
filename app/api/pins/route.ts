import type { NextRequest } from "next/server";
import { fetchPinsPage } from "@/lib/queries";

/** GET /api/pins?cursor=<pinId> — lotes de 20 para el scroll infinito (RF-16). */
export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const q = request.nextUrl.searchParams.get("q") ?? undefined;

  const { pins, nextCursor } = await fetchPinsPage({ cursor, q });

  return Response.json({ pins, nextCursor });
}
