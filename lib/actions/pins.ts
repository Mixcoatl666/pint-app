"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  fieldErrors,
  pinSchema,
  type FieldErrors,
} from "@/lib/validation";

export type CreatePinState =
  | { errors?: FieldErrors; message?: string }
  | undefined;

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

/**
 * RF-8 / RF-9 / RF-10 / RF-13: publica un pin con imagen válida y lleva a su
 * página. Requiere sesión; valida formato, tamaño y legibilidad en el servidor.
 */
export async function createPinAction(
  _prev: CreatePinState,
  formData: FormData,
): Promise<CreatePinState> {
  const user = await requireUser();

  const parsed = pinSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { errors: { image: ["Selecciona una imagen"] } };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { errors: { image: ["La imagen no puede superar los 10 MB"] } };
  }
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    return {
      errors: { image: ["Formato no permitido. Usa JPEG, PNG, WebP o GIF"] },
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let dimensions: { width?: number; height?: number } | undefined;
  try {
    dimensions = imageSize(buffer);
  } catch {
    dimensions = undefined;
  }
  if (!dimensions?.width || !dimensions?.height) {
    return { errors: { image: ["El archivo no es una imagen legible"] } };
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  const filename = `${randomUUID()}${ext}`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);

  const pin = await prisma.pin.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl: `/uploads/${filename}`,
      width: dimensions.width,
      height: dimensions.height,
      ownerId: user.id,
    },
  });

  revalidatePath("/");
  redirect(`/pin/${pin.id}`);
}

/** RF-27: el dueño elimina su pin; feed, perfil, tableros y comentarios se limpian por cascada. */
export async function deletePinAction(pinId: string) {
  const user = await requireUser();

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
    select: { ownerId: true },
  });
  if (!pin) {
    redirect("/"); // ya eliminado: volver al feed
  }
  if (pin.ownerId !== user.id) {
    redirect(`/pin/${pinId}`); // sin permiso: no se elimina
  }

  await prisma.pin.delete({ where: { id: pinId } });

  revalidatePath("/");
  redirect("/");
}
