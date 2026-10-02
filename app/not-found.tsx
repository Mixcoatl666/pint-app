import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="text-5xl">🔍</span>
      <h1 className="mt-4 text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-sm text-zinc-500">
        La página que buscas no existe o fue eliminada.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
