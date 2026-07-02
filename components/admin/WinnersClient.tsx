"use client";

import { Download, FileSpreadsheet, RefreshCw, Trophy } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast, toastFromError } from "@/hooks/useToast";
import { useWinners } from "@/hooks/useWinners";
import { exportCsv, exportExcel } from "@/utils/download";
import { formatDateTime } from "@/utils/date";

export function WinnersClient() {
  const { error, isLoading, refresh, winners } = useWinners();
  const showToast = useToast((state) => state.showToast);

  async function handleRefresh() {
    try {
      await refresh();
      showToast({ title: "รีเฟรชแล้ว", tone: "success" });
    } catch (caught) {
      showToast(toastFromError(caught, "รีเฟรชไม่สำเร็จ"));
    }
  }

  return (
    <div className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">Admin</p>
          <h1 className="text-3xl font-black">Winners</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={<Download aria-hidden="true" className="h-4 w-4" />}
            onClick={() => exportCsv(winners)}
            variant="secondary"
          >
            CSV
          </Button>
          <Button
            icon={<FileSpreadsheet aria-hidden="true" className="h-4 w-4" />}
            onClick={() => void exportExcel(winners)}
            variant="secondary"
          >
            Excel
          </Button>
          <Button
            icon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
            isLoading={isLoading}
            onClick={() => void handleRefresh()}
            variant="secondary"
          >
            Refresh
          </Button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--danger)_42%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 text-sm font-semibold text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      <section className="glass-panel rounded-lg p-4">
        {isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid gap-3">
            {winners.map((winner, index) => (
              <div
                className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                key={winner.uuid}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] font-black text-[var(--accent)]">
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold">
                    {winner.firstName} {winner.lastName}
                  </p>
                  <p className="break-all font-mono text-xs text-[var(--muted)]">{winner.uuid}</p>
                </div>
                <p className="text-sm text-[var(--muted)]">{formatDateTime(winner.timestamp)}</p>
              </div>
            ))}
            {winners.length === 0 ? (
              <div className="grid place-items-center gap-3 py-12 text-center text-[var(--muted)]">
                <Trophy aria-hidden="true" className="h-10 w-10 text-[var(--primary)]" />
                <p className="font-semibold">ยังไม่มีผู้ชนะ</p>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
