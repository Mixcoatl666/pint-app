"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/lib/actions/auth";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {messages.map((message) => (
        <li key={message} className="text-xs text-red-600">
          {message}
        </li>
      ))}
    </ul>
  );
}

/** RF-1 / RF-2 / RF-3: registro con errores por campo en el servidor. */
export default function RegisterPage() {
  const [state, action, pending] = useActionState<
    AuthFormState,
    FormData
  >(registerAction, undefined);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white">
            P
          </span>
          <h1 className="mt-4 text-2xl font-semibold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Únete a Pint y empieza a guardar ideas
          </p>
        </div>

        <form action={action} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-1 h-11 w-full rounded-2xl border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-500"
              placeholder="Tu nombre"
            />
            <FieldError messages={state?.errors?.name} />
          </div>

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
            <FieldError messages={state?.errors?.email} />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-1 h-11 w-full rounded-2xl border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-500"
              placeholder="Mínimo 8 caracteres"
            />
            <FieldError messages={state?.errors?.password} />
          </div>

          {state?.message && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-full bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-red-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
