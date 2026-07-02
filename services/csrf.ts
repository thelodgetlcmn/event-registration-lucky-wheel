import type { CsrfTokenResponse } from "@/types/api";

import { apiPath } from "@/lib/api-path";
import { fetchJson } from "@/lib/fetcher";

let cachedToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  const response = await fetchJson<CsrfTokenResponse>(apiPath("/api/csrf"));
  cachedToken = response.token;
  return cachedToken;
}

export function clearCsrfToken(): void {
  cachedToken = null;
}
