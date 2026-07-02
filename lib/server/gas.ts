import type { ApiResponse } from "@/types/api";

import { API_TIMEOUT_MS } from "@/lib/constants";
import { ApiHttpError } from "@/lib/server/api-error";
import { requireServerEnv } from "@/lib/server/env";

export async function gasGet<TData>(action: string): Promise<ApiResponse<TData>> {
  const env = requireServerEnv();
  const url = new URL(env.googleAppsScriptUrl);
  url.searchParams.set("action", action);
  url.searchParams.set("secret", env.appsScriptSharedSecret);

  return requestGas<TData>(url.toString(), {
    method: "GET",
  });
}

export async function gasPost<TData>(
  payload: Record<string, unknown>,
): Promise<ApiResponse<TData>> {
  const env = requireServerEnv();

  return requestGas<TData>(env.googleAppsScriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      ...payload,
      secret: env.appsScriptSharedSecret,
    }),
  });
}

async function requestGas<TData>(url: string, init: RequestInit): Promise<ApiResponse<TData>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    console.log("===== GAS REQUEST =====");
    console.log("URL:", url);
    console.log("INIT:", init);

    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });

    console.log("HTTP STATUS:", response.status);

    const text = await response.text();
    console.log("BODY:", text);

    if (text.length === 0) {
      throw new ApiHttpError("Apps Script ส่งข้อมูลว่างกลับมา", 502);
    }

    const payload = parseGasResponse<TData>(text);

    if (!response.ok) {
      throw new ApiHttpError(payload.error ?? payload.message, response.status);
    }

    return payload;
  } catch (error) {
    console.error("GAS ERROR:", error);

    if (error instanceof ApiHttpError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiHttpError("Apps Script ตอบกลับช้าเกินไป", 504);
    }

    throw new ApiHttpError("ไม่สามารถเชื่อมต่อ Apps Script ได้", 502);
  } finally {
    clearTimeout(timeout);
  }
}

function parseGasResponse<TData>(text: string): ApiResponse<TData> {
  try {
    const parsed = JSON.parse(text) as ApiResponse<TData>;
    if (
      typeof parsed.success !== "boolean" ||
      typeof parsed.message !== "string" ||
      typeof parsed.statusCode !== "number"
    ) {
      throw new Error("Invalid schema");
    }

    return parsed;
  } catch {
    throw new ApiHttpError("Apps Script ส่ง JSON ไม่ถูกต้อง", 502);
  }
}
