import type { Registrant, RegistrationFormValues } from "@/types/registration";

import { apiPath } from "@/lib/api-path";
import { fetchJson } from "@/lib/fetcher";
import { getCsrfToken } from "@/services/csrf";
import { registrationSchema } from "@/utils/validation";

export async function registerParticipant(values: RegistrationFormValues): Promise<Registrant> {
  const input = registrationSchema.parse(values);
  const csrfToken = await getCsrfToken();

  return fetchJson<Registrant>(apiPath("/api/register"), {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify(input),
  });
}
