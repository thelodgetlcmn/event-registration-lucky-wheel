"use client";

import { ArrowUpDown } from "lucide-react";

import type { Registrant } from "@/types/registration";
import type { RegistrantSortKey, SortDirection } from "@/types/sheet";

import { statusLabels } from "@/lib/constants";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/date";

interface RegistrantTableProps {
  rows: Registrant[];
  sortDirection: SortDirection;
  sortKey: RegistrantSortKey;
  onSort: (key: RegistrantSortKey) => void;
}

const columns: Array<{ key: RegistrantSortKey; label: string }> = [
  { key: "timestamp", label: "Timestamp" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "status", label: "Status" },
  { key: "winner", label: "Winner" },
];

export function RegistrantTable({ onSort, rows, sortDirection, sortKey }: RegistrantTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-strong)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[color-mix(in_srgb,var(--primary)_9%,transparent)]">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-4 py-3 font-bold" key={column.key} scope="col">
                  <button
                    aria-label={`Sort by ${column.label}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-md"
                    onClick={() => onSort(column.key)}
                    type="button"
                  >
                    {column.label}
                    <ArrowUpDown
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4",
                        sortKey === column.key ? "text-[var(--primary)]" : "text-[var(--muted)]",
                      )}
                    />
                    {sortKey === column.key ? (
                      <span className="sr-only">
                        {sortDirection === "asc" ? "ascending" : "descending"}
                      </span>
                    ) : null}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 font-bold" scope="col">
                UUID
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((registrant) => (
              <tr className="border-t border-[var(--border)]" key={registrant.uuid}>
                <td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                  {formatDateTime(registrant.timestamp)}
                </td>
                <td className="px-4 py-3 font-semibold">{registrant.firstName}</td>
                <td className="px-4 py-3 font-semibold">{registrant.lastName}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-lg px-2 py-1 text-xs font-bold",
                      registrant.status === "WINNER"
                        ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]"
                        : "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]",
                    )}
                  >
                    {statusLabels[registrant.status]}
                  </span>
                </td>
                <td className="px-4 py-3">{registrant.winner ? "TRUE" : "FALSE"}</td>
                <td className="max-w-[16rem] truncate px-4 py-3 font-mono text-xs text-[var(--muted)]">
                  {registrant.uuid}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[var(--muted)]" colSpan={6}>
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
