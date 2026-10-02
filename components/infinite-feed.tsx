"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PinDTO } from "@/lib/queries";
import { PinGrid } from "@/components/pin-grid";

/**
 * RF-16: carga lotes de 20 pines al llegar al final del feed y deja de pedir
 * cuando la API devuelve sin cursor.
 */
export function InfiniteFeed({
  initialPins,
  initialCursor,
}: {
  initialPins: PinDTO[];
  initialCursor: string | null;
}) {
  const [pins, setPins] = useState<PinDTO[]>(initialPins);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!cursor) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loadingRef.current) return;

        loadingRef.current = true;

        void (async () => {
          try {
            const response = await fetch(
              `/api/pins?cursor=${encodeURIComponent(cursor)}`,
            );
            if (!response.ok) return;

            const data: { pins: PinDTO[]; nextCursor: string | null } =
              await response.json();

            setPins((previous) => {
              const seen = new Set(previous.map((pin) => pin.id));
              return [
                ...previous,
                ...data.pins.filter((pin) => !seen.has(pin.id)),
              ];
            });
            setCursor(data.nextCursor);
          } finally {
            loadingRef.current = false;
          }
        })();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor]);

  return (
    <>
      <PinGrid pins={pins} />

      <div ref={sentinelRef} className="flex items-center justify-center py-8">
        {cursor && (
          <Loader2
            aria-label="Cargando más pines"
            className="h-6 w-6 animate-spin text-zinc-400"
          />
        )}
      </div>

      {!cursor && pins.length > 0 && (
        <p className="pb-10 text-center text-sm text-zinc-400">
          Has llegado al final
        </p>
      )}
    </>
  );
}
