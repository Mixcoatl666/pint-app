import { z } from "zod";

/** Límites de subida de imágenes (RF-9 / RF-10). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** RF-2 / RF-3: registro con email válido y contraseña de al menos 8 caracteres. */
export const registerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.email("Introduce un email válido").trim().toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("Introduce un email válido").trim().toLowerCase(),
  password: z.string().min(1, "Introduce tu contraseña"),
});

/** RF-9: el pin requiere título; la descripción es opcional. */
export const pinSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  description: z.string().trim().max(2000, "La descripción es demasiado larga"),
});

export const boardSchema = z.object({
  name: z.string().trim().min(1, "El nombre del tablero es obligatorio"),
});

/** RF-34 / RF-35: comentarios de 1 a 500 caracteres. */
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "El comentario no puede estar vacío")
    .max(500, "El comentario no puede superar los 500 caracteres"),
});

export type FieldErrors = Record<string, string[]>;

/** Convierte un error de Zod en errores por campo (RNF-6). */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}
