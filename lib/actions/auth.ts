"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import {
  fieldErrors,
  loginSchema,
  registerSchema,
  type FieldErrors,
} from "@/lib/validation";

export type AuthFormState =
  | { errors?: FieldErrors; message?: string }
  | undefined;

/** RF-1 / RF-2 / RF-3: crea la cuenta e inicia sesión. */
export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { errors: { email: ["Ese email ya está registrado"] } };
  }

  const passwordHash = await hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });

  try {
    // RF-1: el registro deja la sesión iniciada y vuelve al feed.
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "La cuenta se creó pero no se pudo iniciar sesión. Inténtalo de nuevo." };
    }
    throw error; // redirecciones (NEXT_REDIRECT) y otros errores se propagan
  }
  return undefined;
}

/** RF-4 / RF-5: valida credenciales con mensaje genérico si fallan. */
export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { message: "Email o contraseña incorrectos" };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Email o contraseña incorrectos" };
    }
    throw error;
  }
  return undefined;
}

/** RF-7: cierra la sesión y vuelve al feed como visitante. */
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
