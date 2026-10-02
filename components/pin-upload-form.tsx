/* eslint-disable @next/next/no-img-element -- la vista previa usa un object URL temporal del cliente */
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { createPinAction, type CreatePinState } from "@/lib/actions/pins";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/validation";

/**
 * RF-9 / RF-10 / RF-11 / RF-12: subida con arrastrar y soltar, vista previa
 * y validación de formato y tamaño (el servidor la vuelve a comprobar).
 */
export function PinUploadForm() {
  const [state, action, pending] = useActionState<
    CreatePinState,
    FormData
  >(createPinAction, undefined);

  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function acceptFile(candidate: File | null | undefined) {
    if (!candidate) return;

    if (candidate.size === 0) {
      setClientError("El archivo está vacío");
      return;
    }
    if (candidate.size > MAX_UPLOAD_BYTES) {
      setClientError("La imagen no puede superar los 10 MB");
      return;
    }
    if (!ALLOWED_IMAGE_TYPES[candidate.type]) {
      setClientError("Formato no permitido. Usa JPEG, PNG, WebP o GIF");
      return;
    }

    setClientError(null);
    setPreview(URL.createObjectURL(candidate));
  }

  const imageError = clientError ?? state?.errors?.image?.[0];

  return (
    <form action={action} className="mt-6 space-y-5">
      <div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            acceptFile(event.dataTransfer.files?.[0]);
          }}
          className={`flex min-h-64 cursor-pointer items-center justify-center rounded-3xl border-2 border-dashed p-4 transition-colors ${
            dragging
              ? "border-red-400 bg-red-50"
              : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
          }`}
        >
          {preview ? (
            // RF-12: vista previa antes de enviar.
            <img
              src={preview}
              alt="Vista previa de la imagen seleccionada"
              className="max-h-96 w-auto max-w-full rounded-2xl object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-zinc-500">
              <ImagePlus className="h-10 w-10" aria-hidden />
              <p className="mt-3 text-sm font-medium">
                Arrastra y suelta tu imagen aquí
              </p>
              <p className="mt-1 text-xs">o haz clic para elegir un archivo</p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(event) => acceptFile(event.target.files?.[0])}
          aria-label="Seleccionar imagen"
        />

        {imageError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {imageError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 h-11 w-full rounded-2xl border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-500"
          placeholder="Ej. Cena rápida de pasta al limón"
        />
        {state?.errors?.title && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {state.errors.title[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción{" "}
          <span className="font-normal text-zinc-400">(opcional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-500"
          placeholder="Cuéntanos de qué va este pin…"
        />
        {state?.errors?.description && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center gap-2 rounded-full bg-red-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {pending ? "Publicando…" : "Publicar pin"}
        </button>
      </div>
    </form>
  );
}
