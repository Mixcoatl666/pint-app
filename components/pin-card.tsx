/* eslint-disable @next/next/no-img-element -- las imágenes se sirven desde /uploads (route handler) sin optimizador */
import Link from "next/link";
import type { PinDTO } from "@/lib/queries";
import { SaveButton } from "@/components/save-button";

/** Tarjeta de pin: imagen con proporción original (RF-14) y navegación a su página (RF-19). */
export function PinCard({ pin }: { pin: PinDTO }) {
  return (
    <div className="group mb-4 break-inside-avoid">
      <div className="relative">
        <Link
          href={`/pin/${pin.id}`}
          className="block overflow-hidden rounded-2xl bg-zinc-100"
        >
          <img
            src={pin.imageUrl}
            alt={pin.title}
            width={pin.width}
            height={pin.height}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="absolute top-2 right-2 opacity-100 transition-opacity max-md:opacity-100 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <SaveButton pinId={pin.id} />
        </div>
      </div>
      <div className="px-1 pt-2">
        <p className="line-clamp-2 text-sm font-medium text-zinc-800">
          {pin.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
          {pin.owner.name}
        </p>
      </div>
    </div>
  );
}
