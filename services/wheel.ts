import type { Registrant } from "@/types/registration";

import { apiPath } from "@/lib/api-path";
import { fetchJson } from "@/lib/fetcher";
import { getCsrfToken } from "@/services/csrf";

export async function listWinners(): Promise<Registrant[]> {
  return fetchJson<Registrant[]>(apiPath("/api/winners"));
}

export async function drawWinner(): Promise<Registrant> {
  const csrfToken = await getCsrfToken();

  return fetchJson<Registrant>(apiPath("/api/wheel"), {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken,
    },
  });
}
