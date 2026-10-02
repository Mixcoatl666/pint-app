"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState<
    AuthFormState,
    FormData
  >(loginAction, undefined);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white">
            P
          </span>
          <h1 className="mt-4 text-2xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Bienvenido de nuevo a Pint
          </p>
        </div>

        <form action={action} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 h-11 w-full rounded-2xl border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 h-11 w-full rounded-2xl border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-500"
              placeholder="••••••••"
            />
          </div>

          {state?.message && (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-full bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-red-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-400">
        Cuenta de prueba: demo@pint.app / password123
      </p>
    </div>
  );
}
