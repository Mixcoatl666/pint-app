"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/dal";
import { boardSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

export type BoardDTO = { id: string; name: string };

export type SaveResult =
  | { ok: true; boardName: string; already?: boolean }
  | { ok: false; error: string };

/** RF-26: lista los tableros del usuario para el diálogo de guardado. */
export async function getMyBoardsAction(): Promise<
  { boards: BoardDTO[] } | { error: "unauth" }
> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauth" };

  const boards = await prisma.board.findMany({
    where: { ownerId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return { boards };
}

/**
 * RF-22 / RF-23 / RF-24 / RF-25: guarda un pin en un tablero propio.
 * Sin sesión redirige al inicio de sesión sin registrar el guardado.
 */
export async function savePinAction(
  pinId: string,
  boardId: string,
): Promise<SaveResult> {
  const user = await requireUser();

  const [pin, board] = await Promise.all([
    prisma.pin.findUnique({ where: { id: pinId }, select: { id: true } }),
    prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true, name: true, ownerId: true },
    }),
  ]);

  if (!pin) return { ok: false, error: "El pin ya no existe" };
  if (!board || board.ownerId !== user.id) {
    return { ok: false, error: "No existe ese tablero" };
  }

  const existing = await prisma.save.findUnique({
    where: { pinId_boardId: { pinId, boardId } },
    select: { id: true },
  });
  if (existing) {
    return { ok: true, boardName: board.name, already: true };
  }

  try {
    await prisma.save.create({
      data: { pinId, boardId, userId: user.id },
    });
  } catch {
    // Doble clic o peticiones concurrentes: ya estaba guardado.
    return { ok: true, boardName: board.name, already: true };
  }

  return { ok: true, boardName: board.name };
}

/** RF-21 / RF-26: crea un tablero y guarda el pin en él desde el diálogo. */
export async function createBoardAndSaveAction(
  pinId: string,
  name: string,
): Promise<SaveResult | { ok: false; errors: FieldErrors }> {
  const user = await requireUser();

  const parsedName = boardSchema.safeParse({ name });
  if (!parsedName.success) {
    return { ok: false, errors: fieldErrors(parsedName.error) };
  }

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
    select: { id: true },
  });
  if (!pin) return { ok: false, error: "El pin ya no existe" };

  const board = await prisma.board.create({
    data: { name: parsedName.data.name, ownerId: user.id },
  });

  await prisma.save.create({
    data: { pinId, boardId: board.id, userId: user.id },
  });

  return { ok: true, boardName: board.name };
}
