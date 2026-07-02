import { NextResponse } from "next/server";

import type { CsrfTokenResponse } from "@/types/api";

import { CSRF_COOKIE_NAME, createCsrfToken } from "@/lib/server/csrf";
import { okResponse } from "@/lib/server/response";

export function GET(): NextResponse {
  const token = createCsrfToken();
  const response = okResponse<CsrfTokenResponse>("CSRF token created", { token });

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
