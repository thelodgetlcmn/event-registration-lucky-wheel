"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";

import { RegistrantTable } from "@/components/admin/RegistrantTable";
import { StatsCards } from "@/components/admin/StatsCards";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRegistrants } from "@/hooks/useRegistrants";
import { toastFromError, useToast } from "@/hooks/useToast";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Registrant } from "@/types/registration";
import type { RegistrantSortKey, TableState } from "@/types/sheet";
import { csvToImportRegistrants } from "@/utils/csv";
import { exportCsv, exportExcel } from "@/utils/download";

const initialTableState: TableState = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  search: "",
  sortDirection: "desc",
  sortKey: "timestamp",
  status: "ALL",
};

export function DashboardClient() {
  const { counts, error, importRows, isLoading, refresh, registrants, resetDatabase } =
    useRegistrants();
  const [tableState, setTableState] = useState<TableState>(initialTableState);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const showToast = useToast((state) => state.showToast);

  const filteredRows = useMemo(() => {
    const search = tableState.search.trim().toLowerCase();

    return registrants.filter((registrant) => {
      const matchesStatus = tableState.status === "ALL" || registrant.status === tableState.status;
      const matchesSearch =
        search.length === 0 ||
        `${registrant.firstName} ${registrant.lastName} ${registrant.uuid}`
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [registrants, tableState.search, tableState.status]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((left, right) => {
      const comparison = compareRegistrants(left, right, tableState.sortKey);
      return tableState.sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, tableState.sortDirection, tableState.sortKey]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / tableState.pageSize));
  const currentPage = Math.min(tableState.page, pageCount);
  const pageRows = sortedRows.slice(
    (currentPage - 1) * tableState.pageSize,
    currentPage * tableState.pageSize,
  );

  function updateFilters(partial: Partial<TableState>) {
    setTableState((current) => ({ ...current, ...partial, page: 1 }));
  }

  function handleSort(key: RegistrantSortKey) {
    setTableState((current) => ({
      ...current,
      page: 1,
      sortDirection: current.sortKey === key && current.sortDirection === "asc" ? "desc" : "asc",
      sortKey: key,
    }));
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsImporting(true);
    try {
      const rows = csvToImportRegistrants(await file.text());
      const result = await importRows(rows);
      showToast({
        title: "นำเข้า CSV สำเร็จ",
        description: `เพิ่ม ${result.inserted} แถว, ข้าม ${result.skipped} แถว`,
        tone: "success",
      });
    } catch (caught) {
      showToast(toastFromError(caught, "นำเข้า CSV ไม่สำเร็จ"));
    } finally {
      setIsImporting(false);
    }
  }

  async function handleReset() {
    setIsResetting(true);
    try {
      const cleared = await resetDatabase();
      showToast({
        title: "ล้างข้อมูลแล้ว",
        description: `ลบข้อมูล ${cleared} แถวจาก Sheet`,
        tone: "success",
      });
      setIsResetOpen(false);
    } catch (caught) {
      showToast(toastFromError(caught, "ล้างข้อมูลไม่สำเร็จ"));
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">Admin</p>
          <h1 className="text-3xl font-black">Dashboard</h1>
        </div>
        <Button
          icon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
          isLoading={isLoading}
          onClick={() => void refresh()}
          variant="secondary"
        >
          Refresh Data
        </Button>
      </header>

      <StatsCards counts={counts} />

      <section className="glass-panel grid gap-4 rounded-lg p-4">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <label className="grid gap-2 text-sm font-semibold">
            Search
            <span className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                className="focus-ring h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] pl-10 pr-3"
                onChange={(event) => updateFilters({ search: event.target.value })}
                placeholder="ค้นหาชื่อ นามสกุล หรือ UUID"
                type="search"
                value={tableState.search}
              />
            </span>
          </label>

          <div className="flex flex-wrap items-end gap-2">
            <select
              aria-label="Filter status"
              className="focus-ring h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-sm font-semibold"
              onChange={(event) =>
                updateFilters({
                  status:
                    event.target.value === "WINNER"
                      ? "WINNER"
                      : event.target.value === "AVAILABLE"
                        ? "AVAILABLE"
                        : "ALL",
                })
              }
              value={tableState.status}
            >
              <option value="ALL">All</option>
              <option value="AVAILABLE">Available</option>
              <option value="WINNER">Winner</option>
            </select>

            <Button
              icon={<Download aria-hidden="true" className="h-4 w-4" />}
              onClick={() => exportCsv(sortedRows)}
              variant="secondary"
            >
              CSV
            </Button>
            <Button
              icon={<FileSpreadsheet aria-hidden="true" className="h-4 w-4" />}
              onClick={() => void exportExcel(sortedRows)}
              variant="secondary"
            >
              Excel
            </Button>
            <label className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]">
              <Upload aria-hidden="true" className="h-4 w-4" />
              {isImporting ? "Importing" : "Import CSV"}
              <input
                accept=".csv,text/csv"
                className="sr-only"
                onChange={handleImport}
                type="file"
              />
            </label>
            <Button
              icon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
              onClick={() => setIsResetOpen(true)}
              variant="danger"
            >
              Reset
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-[color-mix(in_srgb,var(--danger)_42%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 text-sm font-semibold text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <RegistrantTable
            onSort={handleSort}
            rows={pageRows}
            sortDirection={tableState.sortDirection}
            sortKey={tableState.sortKey}
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            แสดง {pageRows.length.toLocaleString("th-TH")} จาก{" "}
            {sortedRows.length.toLocaleString("th-TH")} รายการ
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage <= 1}
              icon={<ChevronLeft aria-hidden="true" className="h-4 w-4" />}
              onClick={() => setTableState((current) => ({ ...current, page: currentPage - 1 }))}
              size="sm"
              variant="secondary"
            >
              Prev
            </Button>
            <span className="min-w-20 text-center text-sm font-bold">
              {currentPage} / {pageCount}
            </span>
            <Button
              disabled={currentPage >= pageCount}
              icon={<ChevronRight aria-hidden="true" className="h-4 w-4" />}
              onClick={() => setTableState((current) => ({ ...current, page: currentPage + 1 }))}
              size="sm"
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        confirmLabel="Reset Database"
        description="ข้อมูลทุกแถวหลัง Header จะถูกล้างจาก Google Sheets และไม่สามารถย้อนกลับจากแอปนี้ได้"
        isOpen={isResetOpen}
        isWorking={isResetting}
        onCancel={() => setIsResetOpen(false)}
        onConfirm={handleReset}
        title="ล้างฐานข้อมูล?"
      />
    </div>
  );
}

function compareRegistrants(left: Registrant, right: Registrant, key: RegistrantSortKey): number {
  if (key === "winner") {
    return Number(left.winner) - Number(right.winner);
  }

  return String(left[key]).localeCompare(String(right[key]), "th");
}
