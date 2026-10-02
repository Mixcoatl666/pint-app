"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus } from "lucide-react";
import {
  createBoardAndSaveAction,
  getMyBoardsAction,
  savePinAction,
} from "@/lib/actions/boards";

type Board = { id: string; name: string };

/**
 * RF-22 / RF-23 / RF-24 / RF-26: guarda el pin en un tablero. Sin sesión
 * redirige al inicio de sesión; incluye creación de tablero en el diálogo.
 */
export function SaveButton({ pinId }: { pinId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function openDialog() {
    setMessage(null);
    setFieldError(null);
    setBoards(null);
    setOpen(true);

    const result = await getMyBoardsAction();
    if ("error" in result) {
      // RF-22: sin sesión → inicio de sesión, sin guardar nada.
      router.push("/login");
      return;
    }
    setBoards(result.boards);
  }

  function handleSave(boardId: string) {
    startTransition(async () => {
      const result = await savePinAction(pinId, boardId);
      if (result.ok) {
        // RF-24: si ya estaba, se indica sin duplicar.
        setMessage(
          result.already
            ? `Ya estaba guardado en «${result.boardName}»`
            : `Guardado en «${result.boardName}»`,
        );
      } else {
        setMessage(result.error);
      }
    });
  }

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    startTransition(async () => {
      const result = await createBoardAndSaveAction(pinId, name);
      if ("errors" in result) {
        setFieldError(result.errors.name?.[0] ?? "Nombre no válido");
        return;
      }
      if (result.ok) {
        setFieldError(null);
        setNewName("");
        // RF-26: el tablero nuevo queda creado y el pin guardado en él.
        setMessage(`Creado y guardado en «${result.boardName}»`);
        const refreshed = await getMyBoardsAction();
        if (!("error" in refreshed)) setBoards(refreshed.boards);
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Guardar pin en un tablero"
        className="flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
        disabled={pending}
      >
        <BookmarkPlus className="h-4 w-4" aria-hidden />
        Guardar
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Guardar en tablero"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Guardar en tablero</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="rounded-full px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            {message && (
              <p
                role="status"
                className="mt-3 rounded-xl bg-zinc-100 px-3 py-2 text-sm"
              >
                {message}
              </p>
            )}

            <div className="mt-3 max-h-64 overflow-y-auto">
              {boards === null ? (
                <p className="py-3 text-sm text-zinc-500">Cargando tableros…</p>
              ) : boards.length === 0 ? (
                <p className="py-3 text-sm text-zinc-500">
                  Aún no tienes tableros. Crea el primero aquí abajo.
                </p>
              ) : (
                <ul className="space-y-1">
                  {boards.map((board) => (
                    <li key={board.id}>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleSave(board.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 disabled:opacity-60"
                      >
                        <span className="truncate font-medium">
                          {board.name}
                        </span>
                        <span className="pl-2 text-xs text-zinc-500">
                          {pending ? "Guardando…" : "Guardar"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={handleCreate}
              className="mt-3 border-t border-zinc-100 pt-3"
            >
              <label
                htmlFor={`new-board-${pinId}`}
                className="text-sm font-medium"
              >
                Crear tablero
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id={`new-board-${pinId}`}
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Nombre del tablero"
                  className="h-9 min-w-0 flex-1 rounded-full border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-500"
                />
                <button
                  type="submit"
                  disabled={pending || !newName.trim()}
                  className="rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  Crear
                </button>
              </div>
              {fieldError && (
                <p className="mt-1.5 text-xs text-red-600">{fieldError}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
