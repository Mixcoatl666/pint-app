/* eslint-disable @next/next/no-img-element -- las imágenes se sirven desde /uploads (route handler) sin optimizador */
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { fetchCommentThread, fetchPinsByOwner } from "@/lib/queries";
import { deletePinAction } from "@/lib/actions/pins";
import { SaveButton } from "@/components/save-button";
import { CommentSection } from "@/components/comment-section";
import { ConfirmForm } from "@/components/confirm-form";
import { PinGrid } from "@/components/pin-grid";

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

function formatDate(date: Date) {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pin = await prisma.pin.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: pin?.title ?? "Pin no encontrado" };
}

/**
 * RF-18 / RF-19 / RF-20: página dedicada por imagen con autor, fecha,
 * comentarios, guardado y otros pines del mismo autor.
 */
export default async function PinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pin = await prisma.pin.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      width: true,
      height: true,
      createdAt: true,
      ownerId: true,
      owner: { select: { id: true, name: true } },
    },
  });

  if (!pin) {
    notFound(); // RF-20
  }

  const [viewer, thread, ownerPins] = await Promise.all([
    getCurrentUser(),
    fetchCommentThread(pin.id),
    fetchPinsByOwner(pin.ownerId),
  ]);

  const related = ownerPins.filter((item) => item.id !== pin.id).slice(0, 20);
  const isOwner = viewer?.id === pin.ownerId;

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200 md:flex">
        <div className="flex items-center justify-center bg-zinc-100 md:w-1/2">
          <img
            src={pin.imageUrl}
            alt={pin.title}
            width={pin.width}
            height={pin.height}
            className="h-auto max-h-[85vh] w-full object-contain"
          />
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SaveButton pinId={pin.id} />
            {isOwner && (
              <ConfirmForm
                action={deletePinAction.bind(null, pin.id)}
                confirmMessage="¿Eliminar este pin? Se borrarán también sus comentarios y guardados."
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Eliminar
              </ConfirmForm>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold break-words">
              {pin.title}
            </h1>
            {pin.description && (
              <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-zinc-600">
                {pin.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
            <Link
              href={`/user/${pin.owner.id}`}
              className="group flex min-w-0 items-center gap-2.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                {initials(pin.owner.name)}
              </span>
              <span className="truncate text-sm font-medium group-hover:underline">
                {pin.owner.name}
              </span>
            </Link>
            <time
              dateTime={pin.createdAt.toISOString()}
              className="shrink-0 text-sm text-zinc-500"
            >
              {formatDate(pin.createdAt)}
            </time>
          </div>

          <CommentSection
            pinId={pin.id}
            ownerId={pin.ownerId}
            threads={thread}
            viewer={
              viewer
                ? { id: viewer.id, name: viewer.name ?? "Usuario" }
                : null
            }
          />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">
            Más pines de {pin.owner.name}
          </h2>
          <PinGrid pins={related} />
        </section>
      )}
    </div>
  );
}
