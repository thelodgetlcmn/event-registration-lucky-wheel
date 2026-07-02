import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { ApiResponse } from "@/types/api";

import { ApiHttpError, getErrorMessage } from "@/lib/server/api-error";

export function okResponse<TData>(message: string, data: TData, statusCode = 200): NextResponse {
  const payload: ApiResponse<TData> = {
    success: true,
    message,
    data,
    error: null,
    statusCode,
  };

  return NextResponse.json(payload, { status: normalizeHttpStatus(statusCode) });
}

export function failResponse(message: string, statusCode = 500): NextResponse {
  const payload: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    error: message,
    statusCode,
  };

  return NextResponse.json(payload, { status: normalizeHttpStatus(statusCode) });
}

export function proxyGasResponse<TData>(payload: ApiResponse<TData>): NextResponse {
  return NextResponse.json(payload, { status: normalizeHttpStatus(payload.statusCode) });
}

export function routeErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiHttpError) {
    return failResponse(error.message, error.statusCode);
  }

  if (error instanceof ZodError) {
    return failResponse(error.issues.map((issue) => issue.message).join(", "), 422);
  }

  return failResponse(getErrorMessage(error), 500);
}

function normalizeHttpStatus(statusCode: number): number {
  if (statusCode >= 100 && statusCode <= 599) {
    return statusCode;
  }

  return 500;
}
