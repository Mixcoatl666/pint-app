import { fetchPinsPage } from "@/lib/queries";
import { InfiniteFeed } from "@/components/infinite-feed";

export const dynamic = "force-dynamic";

/** RF-15 / RF-16 / RF-17: feed público en masonry con scroll infinito. */
export default async function HomePage() {
  const { pins, nextCursor } = await fetchPinsPage({});

  if (pins.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
          🖼️
        </span>
        <h1 className="mt-4 text-xl font-semibold">Aún no hay pines</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sé el primero en subir una imagen y aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-6">
      <InfiniteFeed initialPins={pins} initialCursor={nextCursor} />
    </div>
  );
}
