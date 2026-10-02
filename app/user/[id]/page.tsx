import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { prisma } from "@/lib/db";
import { fetchPinsByOwner } from "@/lib/queries";
import { PinGrid } from "@/components/pin-grid";

export const metadata: Metadata = { title: "Perfil" };

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((word) => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/** RF-28 / RF-30: perfil con avatar, nombre, pines y tableros. */
export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!user) {
    notFound(); // RF-30
  }

  const [pins, boards] = await Promise.all([
    fetchPinsByOwner(user.id),
    prisma.board.findMany({
      where: { ownerId: user.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { saves: true } },
        saves: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { pin: { select: { imageUrl: true } } },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-8 sm:px-6">
      <header className="flex flex-col items-center text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-3xl font-bold text-white">
          {initials(user.name)}
        </span>
        <h1 className="mt-4 text-3xl font-semibold">{user.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {pins.length} {pins.length === 1 ? "pin" : "pines"} ·{" "}
          {boards.length} {boards.length === 1 ? "tablero" : "tableros"}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Tableros</h2>
        {boards.length === 0 ? (
          <p className="rounded-2xl bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
            Este usuario aún no tiene tableros.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {boards.map((board) => (
              <li key={board.id}>
                <Link
                  href={`/board/${board.id}`}
                  className="group block overflow-hidden rounded-2xl bg-zinc-100"
                >
                  {board.saves[0]?.pin ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={board.saves[0].pin.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-36 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center text-zinc-400">
                      <LayoutGrid className="h-8 w-8" aria-hidden />
                    </div>
                  )}
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-semibold">
                      {board.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {board._count.saves}{" "}
                      {board._count.saves === 1 ? "pin guardado" : "pines guardados"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Pines</h2>
        {pins.length === 0 ? (
          <p className="rounded-2xl bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
            Este usuario aún no ha publicado pines.
          </p>
        ) : (
          <PinGrid pins={pins} />
        )}
      </section>
    </div>
  );
}
