"use client";

import { create } from "zustand";

import type { ToastMessage, ToastTone } from "@/types/ui";

interface ToastStore {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }].slice(-4),
    }));

    window.setTimeout(
      () => {
        set((state) => ({
          toasts: state.toasts.filter((item) => item.id !== id),
        }));
      },
      toast.tone === "error" ? 6500 : 4000,
    );
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export function toastFromError(error: unknown, fallback: string, tone: ToastTone = "error") {
  return {
    title: fallback,
    description: error instanceof Error ? error.message : undefined,
    tone,
  };
}
