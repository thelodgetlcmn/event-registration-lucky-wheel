import type { ApiResponse } from "@/types/api";

import { API_TIMEOUT_MS } from "@/lib/constants";

export class ApiClientError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
  }
}

export async function fetchJson<TData>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<TData> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), init.timeoutMs ?? API_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    });

    const text = await response.text();
    if (text.length === 0) {
      throw new ApiClientError("API ส่งข้อมูลว่างกลับมา", response.status);
    }

    const payload = parseApiResponse<TData>(text);
    if (!response.ok || !payload.success) {
      throw new ApiClientError(
        payload.error ?? payload.message,
        payload.statusCode || response.status,
      );
    }

    return payload.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError("เชื่อมต่อ API เกินเวลาที่กำหนด", 408);
    }

    throw new ApiClientError("ไม่สามารถเชื่อมต่อ API ได้", 503);
  } finally {
    window.clearTimeout(timeout);
  }
}

function parseApiResponse<TData>(text: string): ApiResponse<TData> {
  try {
    const parsed = JSON.parse(text) as ApiResponse<TData>;
    if (
      typeof parsed.success !== "boolean" ||
      typeof parsed.message !== "string" ||
      typeof parsed.statusCode !== "number"
    ) {
      throw new Error("Invalid API schema");
    }
    return parsed;
  } catch {
    throw new ApiClientError("API ส่ง JSON ไม่ถูกต้อง", 502);
  }
}
