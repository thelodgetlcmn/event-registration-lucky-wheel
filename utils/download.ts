import type { Registrant } from "@/types/registration";

import { registrantsToCsv } from "@/utils/csv";

export function downloadBlob(filename: string, content: BlobPart, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportCsv(registrants: Registrant[]): void {
  downloadBlob("event-registrants.csv", registrantsToCsv(registrants), "text/csv;charset=utf-8");
}

export async function exportExcel(registrants: Registrant[]): Promise<void> {
  const xlsx = await import("xlsx");
  const worksheet = xlsx.utils.json_to_sheet(
    registrants.map((registrant) => ({
      Timestamp: registrant.timestamp,
      "First Name": registrant.firstName,
      "Last Name": registrant.lastName,
      UUID: registrant.uuid,
      Status: registrant.status,
      Winner: registrant.winner,
    })),
  );
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Registrants");
  const arrayBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  downloadBlob(
    "event-registrants.xlsx",
    arrayBuffer,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}
