import type { ImportRegistrant, ImportResult, Registrant } from "@/types/registration";

import { apiPath } from "@/lib/api-path";
import { fetchJson } from "@/lib/fetcher";
import { getCsrfToken } from "@/services/csrf";
import { importRowsSchema } from "@/utils/validation";

export async function listRegistrants(): Promise<Registrant[]> {
  return fetchJson<Registrant[]>(apiPath("/api/sheet"));
}

export async function resetDatabase(): Promise<{ cleared: number }> {
  const csrfToken = await getCsrfToken();

  return fetchJson<{ cleared: number }>(apiPath("/api/sheet"), {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ action: "reset" }),
  });
}

export async function importRegistrants(rows: ImportRegistrant[]): Promise<ImportResult> {
  const validatedRows = importRowsSchema.parse(rows);
  const csrfToken = await getCsrfToken();

  return fetchJson<ImportResult>(apiPath("/api/sheet"), {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ action: "import", rows: validatedRows }),
  });
}
