import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { fetchPinsMatching } from "@/lib/queries";
import { PinGrid } from "@/components/pin-grid";

export const metadata: Metadata = { title: "Buscar" };

export const dynamic = "force-dynamic";

/** RF-31 / RF-32: búsqueda por subcadena en título o descripción, sin distingir mayúsculas. */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const pins = await fetchPinsMatching(query);

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-6">
      <h1 className="text-xl font-semibold">
        {query ? (
          <>
            Resultados para <span className="text-red-600">«{query}»</span>
          </>
        ) : (
          "Todos los pines"
        )}
      </h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500">
        {pins.length} {pins.length === 1 ? "pin encontrado" : "pines encontrados"}
      </p>

      {pins.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-zinc-500">
          <SearchX className="h-10 w-10" aria-hidden />
          <p className="mt-4 text-base font-medium text-zinc-700">
            Sin resultados para esa búsqueda
          </p>
          <p className="mt-1 text-sm">Prueba con otras palabras clave.</p>
        </div>
      ) : (
        <PinGrid pins={pins} />
      )}
    </div>
  );
}
