"use client";

import { FormEventHandler, ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface TableEditModalProps {
  isOpen: boolean;
  badgeLabel: string;
  badgeIcon?: ReactNode;
  title: string;
  description: string;
  helperText?: string;
  errorMessage?: string;
  submitText: string;
  cancelText?: string;
  isSubmitting?: boolean;
  maxWidthClassName?: string;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}

export default function TableEditModal({
  isOpen,
  badgeLabel,
  badgeIcon,
  title,
  description,
  helperText,
  errorMessage,
  submitText,
  cancelText = "Cancelar",
  isSubmitting = false,
  maxWidthClassName = "max-w-3xl",
  onClose,
  onSubmit,
  children,
}: TableEditModalProps): React.ReactNode {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-overlay backdrop-blur-[6px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-4xl border border-inverse-60 bg-gradient-to-b from-surface-warm to-surface-soft shadow-theme-modal-lg ${maxWidthClassName}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-soft px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-warning bg-surface-warning px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
              {badgeIcon}
              {badgeLabel}
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-fg-strong">
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-surface text-neutral"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>

          <div className="border-t border-border-soft bg-inverse-75 px-6 py-4">
            {errorMessage && <p className="mb-3 text-sm text-danger">{errorMessage}</p>}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">{helperText}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm text-neutral"
                >
                  {cancelText}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-fg shadow-theme-accent transition hover:brightness-[0.98] disabled:opacity-60"
                >
                  {submitText}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
