"use client";

/**
 * Form con confirmación previa en el cliente (usado para eliminar pines y
 * comentarios). La autorización real se verifica en la Server Action.
 */
export function ConfirmForm({
  confirmMessage,
  action,
  className,
  children,
}: {
  confirmMessage: string;
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
