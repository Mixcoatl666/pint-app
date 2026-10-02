import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Devuelve el usuario de la sesión o null. Memoizado por render. */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});

/** Como getCurrentUser, pero redirige a /login si no hay sesión (RF-8). */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
