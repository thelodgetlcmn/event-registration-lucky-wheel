"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="glass-panel w-full max-w-lg rounded-lg p-6">
        <p className="text-sm font-bold text-[var(--danger)]">Error</p>
        <h1 className="mt-2 text-2xl font-black">โหลดหน้าไม่สำเร็จ</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{error.message}</p>
        <Button
          className="mt-5"
          icon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
          onClick={reset}
        >
          ลองใหม่
        </Button>
      </section>
    </main>
  );
}
