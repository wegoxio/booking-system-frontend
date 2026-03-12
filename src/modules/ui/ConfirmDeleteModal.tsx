"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  checkboxLabel?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDeleteModal({
  isOpen,
  title,
  description,
  itemName,
  checkboxLabel = "Confirmo que deseo eliminar este registro permanentemente.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsChecked(false);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setIsChecked(false);

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, itemName]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isConfirming) return;
    onClose();
  };

  const handleConfirm = () => {
    if (!isChecked || isConfirming) return;
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar modal de confirmacion"
        className="absolute inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[5px]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,#fffefb_0%,#f8fafc_100%)] shadow-[0_28px_80px_rgba(15,23,42,0.25)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#edf0f5] px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f4c7c7] bg-[#fff1f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a23a3a]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Confirmacion critica
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#202534]">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isConfirming}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e4e7ee] bg-white text-[#4c576d] disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-2xl border border-[#f2d4d4] bg-[#fff7f7] p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#8f2d2d]">
              <Trash2 className="h-4 w-4" />
              Accion irreversible
            </div>
            <p className="mt-2 text-sm text-[#7b3f3f]">{description}</p>
            {itemName && (
              <p className="mt-2 text-sm text-[#7b3f3f]">
                Registro: <span className="font-semibold">{itemName}</span>
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-[#e7ebf3] bg-white px-4 py-3 text-sm text-[#3f4655]">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(event) => setIsChecked(event.target.checked)}
              className="mt-0.5"
              disabled={isConfirming}
            />
            <span>{checkboxLabel}</span>
          </label>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#edf0f5] bg-white/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isConfirming}
            className="rounded-xl border border-[#d8dae1] bg-white px-4 py-2.5 text-sm text-[#454b59] disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isChecked || isConfirming}
            className="rounded-xl bg-[#df5f5f] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(223,95,95,0.32)] transition hover:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConfirming ? "Eliminando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
