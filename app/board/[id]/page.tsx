import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { pinSelect, toPinDTO } from "@/lib/queries";
import { PinGrid } from "@/components/pin-grid";

export const metadata: Metadata = { title: "Tablero" };

/** RF-29 / RF-30: tablero con sus pines guardados, del más reciente al más antiguo. */
export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const board = await prisma.board.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      owner: { select: { id: true, name: true } },
      saves: {
        orderBy: { createdAt: "desc" },
        select: { pin: { select: pinSelect } },
      },
    },
  });

  if (!board) {
    notFound(); // RF-30
  }

  const pins = board.saves.map((save) => toPinDTO(save.pin));

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-8 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-semibold">{board.name}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {pins.length} {pins.length === 1 ? "pin" : "pines"} · por{" "}
          <Link
            href={`/user/${board.owner.id}`}
            className="font-medium text-zinc-700 hover:underline"
          >
            {board.owner.name}
          </Link>
        </p>
      </header>

      <div className="mt-8">
        {pins.length === 0 ? (
          <p className="rounded-2xl bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
            Este tablero está vacío. Guarda pines desde el feed para llenarlo.
          </p>
        ) : (
          <PinGrid pins={pins} />
        )}
      </div>
    </div>
  );
}
