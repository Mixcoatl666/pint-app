"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import {
  createCommentAction,
  deleteCommentAction,
  type CommentFormState,
} from "@/lib/actions/comments";
import type { CommentThreadDTO } from "@/lib/queries";

type Viewer = { id: string; name: string } | null;
type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

/** RF-34 / RF-35: formulario de comentario o respuesta (1–500 caracteres). */
function CommentForm({
  pinId,
  parentId,
  placeholder,
  onCancel,
}: {
  pinId: string;
  parentId?: string;
  placeholder: string;
  onCancel?: () => void;
}) {
  const [state, action, pending] = useActionState<
    CommentFormState,
    FormData
  >(createCommentAction, undefined);

  return (
    <form action={action} className="mt-2">
      <input type="hidden" name="pinId" value={pinId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <div className="flex items-start gap-2">
        <textarea
          name="content"
          rows={parentId ? 2 : 3}
          required
          maxLength={500}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 resize-none rounded-2xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-zinc-500"
        />
        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            type="submit"
            disabled={pending}
            className="flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            Enviar
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-8 rounded-full px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
      {state?.error && (
        <p role="alert" className="mt-1.5 text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}

function CommentItem({
  comment,
  ownerId,
  viewer,
  onReply,
}: {
  comment: Comment;
  ownerId: string;
  viewer: Viewer;
  onReply?: () => void;
}) {
  const canDelete =
    viewer !== null &&
    (viewer.id === comment.author.id || viewer.id === ownerId);

  return (
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700"
      >
        {initials(comment.author.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold">{comment.author.name}</span>
          <time dateTime={comment.createdAt} className="text-xs text-zinc-400">
            {formatDate(comment.createdAt)}
          </time>
        </p>
        <p className="mt-0.5 text-sm whitespace-pre-wrap text-zinc-700">
          {comment.content}
        </p>
        <div className="mt-1 flex items-center gap-3">
          {onReply && viewer && (
            <button
              type="button"
              onClick={onReply}
              className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Responder
            </button>
          )}
          {canDelete && (
            <form
              action={deleteCommentAction.bind(null, comment.id)}
              onSubmit={(event) => {
                if (!window.confirm("¿Eliminar este comentario?")) {
                  event.preventDefault();
                }
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Eliminar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * RF-33 a RF-41: hilo con raíces ordenadas y respuestas ancladas a su raíz
 * (máx. 2 niveles), borrado por autor o dueño del pin, y solo lectura sin
 * sesión.
 */
export function CommentSection({
  pinId,
  ownerId,
  threads,
  viewer,
}: {
  pinId: string;
  ownerId: string;
  threads: CommentThreadDTO[];
  viewer: Viewer;
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const total = threads.reduce(
    (count, root) => count + 1 + root.replies.length,
    0,
  );

  return (
    <section aria-label="Comentarios" className="border-t border-zinc-100 pt-4">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        Comentarios
        {total > 0 && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
            {total}
          </span>
        )}
      </h2>

      {viewer ? (
        <CommentForm pinId={pinId} placeholder="Añade un comentario…" />
      ) : (
        // RF-33: sin sesión, el hilo es de solo lectura con enlace a entrar.
        <p className="mt-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          <Link
            href="/login"
            className="font-semibold text-red-600 hover:underline"
          >
            Inicia sesión
          </Link>{" "}
          para comentar.
        </p>
      )}

      {threads.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">
          Todavía no hay comentarios. ¡Sé el primero!
        </p>
      ) : (
        <ul>
          {threads.map((root) => (
            <li key={root.id} className="mt-4">
              <CommentItem
                comment={root}
                ownerId={ownerId}
                viewer={viewer}
                onReply={() =>
                  setReplyingTo((current) =>
                    current === root.id ? null : root.id,
                  )
                }
              />

              {replyingTo === root.id && viewer && (
                <div className="mt-2 pl-10">
                  <CommentForm
                    pinId={pinId}
                    parentId={root.id}
                    placeholder={`Responder a ${root.author.name}…`}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}

              {root.replies.length > 0 && (
                <ul>
                  {root.replies.map((reply) => (
                    <li key={reply.id} className="mt-3 pl-10">
                      <CommentItem
                        comment={reply}
                        ownerId={ownerId}
                        viewer={viewer}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
