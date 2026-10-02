import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const FEED_BATCH = 20;

export type PinDTO = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  width: number;
  height: number;
  createdAt: string;
  owner: { id: string; name: string };
};

export type CommentThreadDTO = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
  replies: {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string };
  }[];
};

export const pinSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  width: true,
  height: true,
  createdAt: true,
  owner: { select: { id: true, name: true } },
} satisfies Prisma.PinSelect;

type PinRow = Prisma.PinGetPayload<{ select: typeof pinSelect }>;

export function toPinDTO(pin: PinRow): PinDTO {
  return { ...pin, createdAt: pin.createdAt.toISOString() };
}

/** Búsqueda por subcadena en título o descripción, sin distinguir mayúsculas (RF-31). */
function buildWhere(q?: string): Prisma.PinWhereInput {
  const term = q?.trim();
  if (!term) return {};
  return {
    OR: [{ title: { contains: term } }, { description: { contains: term } }],
  };
}

const pinOrderBy: Prisma.PinOrderByWithRelationInput[] = [
  { createdAt: "desc" },
  { id: "desc" },
];

/** Lote de pines para el feed con paginación por cursor (RF-15 / RF-16). */
export async function fetchPinsPage({
  cursor,
  q,
  take = FEED_BATCH,
}: {
  cursor?: string;
  q?: string;
  take?: number;
}): Promise<{ pins: PinDTO[]; nextCursor: string | null }> {
  const rows = await prisma.pin.findMany({
    where: buildWhere(q),
    orderBy: pinOrderBy,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: pinSelect,
  });

  const hasMore = rows.length > take;
  const page = hasMore ? rows.slice(0, take) : rows;

  return {
    pins: page.map(toPinDTO),
    nextCursor: hasMore && page.length > 0 ? page[page.length - 1]!.id : null,
  };
}

/** Todos los pines que coinciden con la búsqueda (RF-31 / RF-32). */
export async function fetchPinsMatching(q?: string): Promise<PinDTO[]> {
  const rows = await prisma.pin.findMany({
    where: buildWhere(q),
    orderBy: pinOrderBy,
    select: pinSelect,
  });
  return rows.map(toPinDTO);
}

/** Pines de un usuario, del más reciente al más antiguo (RF-28). */
export async function fetchPinsByOwner(ownerId: string): Promise<PinDTO[]> {
  const rows = await prisma.pin.findMany({
    where: { ownerId },
    orderBy: pinOrderBy,
    select: pinSelect,
  });
  return rows.map(toPinDTO);
}

/** Hilo de comentarios de un pin (RF-38): raíces ascendentes con sus respuestas. */
export async function fetchCommentThread(
  pinId: string,
): Promise<CommentThreadDTO[]> {
  const roots = await prisma.comment.findMany({
    where: { pinId, parentId: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: { select: { id: true, name: true } },
        },
      },
    },
  });

  return roots.map((root) => ({
    ...root,
    createdAt: root.createdAt.toISOString(),
    replies: root.replies.map((reply) => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
    })),
  }));
}
