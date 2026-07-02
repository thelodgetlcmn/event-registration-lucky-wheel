"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

const toneIcon = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const toneClass = {
  success: "border-[color-mix(in_srgb,var(--success)_40%,var(--border))]",
  error: "border-[color-mix(in_srgb,var(--danger)_48%,var(--border))]",
  info: "border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]",
} as const;

export function ToastViewport() {
  const { removeToast, toasts } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-3"
    >
      {toasts.map((toast) => {
        const Icon = toneIcon[toast.tone];

        return (
          <div
            className={cn(
              "glass-panel grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg p-4",
              toneClass[toast.tone],
            )}
            key={toast.id}
            role="status"
          >
            <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 text-[var(--primary)]" />
            <div className="min-w-0">
              <p className="text-sm font-bold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-[var(--muted)]">{toast.description}</p>
              ) : null}
            </div>
            <button
              aria-label="ปิดแจ้งเตือน"
              className="focus-ring rounded-md p-1 hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
              onClick={() => removeToast(toast.id)}
              type="button"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
