"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  isWorking?: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  cancelLabel = "ยกเลิก",
  confirmLabel = "ยืนยัน",
  description,
  isOpen,
  isWorking = false,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4"
      role="dialog"
    >
      <div className="glass-panel w-full max-w-md rounded-lg p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={isWorking} onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button isLoading={isWorking} onClick={onConfirm} variant="danger">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
