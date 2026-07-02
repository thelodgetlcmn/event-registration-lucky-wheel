import { cookies } from "next/headers";

import { ApiHttpError } from "@/lib/server/api-error";

export const CSRF_COOKIE_NAME = "event_registration_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

export function createCsrfToken(): string {
  return crypto.randomUUID();
}

export async function assertCsrf(request: Request): Promise<void> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new ApiHttpError("CSRF token ไม่ถูกต้อง", 403);
  }
}
