"use client";

import { PartyPopper, X } from "lucide-react";
import { useEffect } from "react";

import type { Registrant } from "@/types/registration";

type WinnerModalProps = {
  onClose: () => void;
  winner: Registrant | null;
};

export function WinnerModal({ onClose, winner }: WinnerModalProps) {
  useEffect(() => {
    if (!winner) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, winner]);

  if (!winner) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-8 text-center shadow-2xl animate-in zoom-in-95 fade-in duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="ปิด"
          className="absolute right-4 top-4 rounded-full p-1 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]">
          <PartyPopper aria-hidden="true" className="h-8 w-8 text-[var(--accent)]" />
        </div>

        <p className="text-sm font-bold uppercase tracking-wide text-[var(--primary)]">
          ยินดีด้วย
        </p>
        <h2 className="mt-2 text-3xl font-black">
          {winner.firstName} {winner.lastName}
        </h2>

        <button
          className="mt-6 w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-[var(--primary-foreground)] transition hover:opacity-90"
          onClick={onClose}
          type="button"
        >
          ปิดหน้าต่างนี้
        </button>
      </div>
    </div>
  );
}