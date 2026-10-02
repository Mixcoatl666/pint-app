import Link from "next/link";
import Form from "next/form";
import { Plus, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Pint, ir al inicio"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white">
            P
          </span>
          <span className="hidden text-xl font-bold tracking-tight sm:block">
            pint
          </span>
        </Link>

        <Form action="/search" className="relative min-w-0 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            name="q"
            placeholder="Buscar pines"
            aria-label="Buscar pines"
            className="h-10 w-full rounded-full bg-zinc-100 pr-4 pl-9 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:bg-zinc-200"
          />
        </Form>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <Link
                href="/create"
                className="flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <Plus className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Crear</span>
              </Link>
              <UserMenu user={{ id: user.id, name: user.name ?? "Usuario" }} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-100"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="hidden rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:block"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
