import type { PinDTO } from "@/lib/queries";
import { PinCard } from "@/components/pin-card";

/** Rejilla masonry (RF-15): columnas CSS con tarjetas que conservan su proporción. */
export function PinGrid({ pins }: { pins: PinDTO[] }) {
  return (
    <div className="columns-2 gap-4 md:columns-3 lg:columns-4 xl:columns-5">
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin} />
      ))}
    </div>
  );
}
