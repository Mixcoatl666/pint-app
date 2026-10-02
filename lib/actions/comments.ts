"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { commentSchema } from "@/lib/validation";

export type CommentFormState = { error?: string } | undefined;

/**
 * RF-33 / RF-34 / RF-35 / RF-36 / RF-37: publica un comentario o una
 * respuesta. Las respuestas a respuestas se anclan a la raíz (máx. 2 niveles).
 */
export async function createCommentAction(
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const user = await requireUser(); // sin sesión → /login (RF-8 / RF-33)

  const pinId = String(formData.get("pinId") ?? "");
  const parentIdRaw = formData.get("parentId");

  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    return { error: message ?? "El comentario no es válido" };
  }

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
    select: { id: true },
  });
  if (!pin) {
    return { error: "El pin ya no existe" }; // caso límite: pin eliminado
  }

  let parentId: string | null = null;
  if (parentIdRaw) {
    const parent = await prisma.comment.findUnique({
      where: { id: String(parentIdRaw) },
      select: { id: true, parentId: true, pinId: true },
    });
    if (!parent || parent.pinId !== pinId) {
      return { error: "No se pudo responder a ese comentario" };
    }
    // RF-37: profundidad máxima de dos niveles → responder a la respuesta
    // se asocia a la raíz del hilo.
    parentId = parent.parentId ?? parent.id;
  }

  await prisma.comment.create({
    data: {
      content: parsed.data.content,
      pinId,
      parentId,
      authorId: user.id,
    },
  });

  refresh(); // RF-34: el comentario aparece en el hilo
  return undefined;
}

/**
 * RF-39 / RF-40 / RF-41: borra un comentario si eres su autor o el dueño del
 * pin. Sin permiso, la operación se ignora y el comentario permanece.
 */
export async function deleteCommentAction(commentId: string) {
  const user = await requireUser(); // sin sesión → /login (RF-8)

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, pin: { select: { ownerId: true } } },
  });

  if (!comment) {
    refresh();
    return;
  }

  const allowed =
    user.id === comment.authorId || user.id === comment.pin.ownerId;
  if (!allowed) {
    refresh(); // RF-40: rechazado, el comentario permanece
    return;
  }

  // La cascada del esquema elimina también las respuestas (RF-41).
  await prisma.comment.delete({ where: { id: commentId } });
  refresh();
}
