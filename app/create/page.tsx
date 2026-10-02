import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { PinUploadForm } from "@/components/pin-upload-form";

export const metadata: Metadata = { title: "Crear pin" };

/** RF-8: sin sesión esta ruta redirige al inicio de sesión. */
export default async function CreatePage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Crear un pin</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Sube una imagen (JPEG, PNG, WebP o GIF, hasta 10 MB) y dale un título.
      </p>
      <PinUploadForm />
    </div>
  );
}
