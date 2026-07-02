import { NextResponse } from "next/server";

import type { ImportResult, Registrant } from "@/types/registration";

import { assertCsrf } from "@/lib/server/csrf";
import { gasGet, gasPost } from "@/lib/server/gas";
import { ApiHttpError } from "@/lib/server/api-error";
import { isRecord, readJsonBody, readStringField } from "@/lib/server/request";
import { proxyGasResponse, routeErrorResponse } from "@/lib/server/response";
import { importRowsSchema } from "@/utils/validation";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const gasResponse = await gasGet<Registrant[]>("list");
    return proxyGasResponse(gasResponse);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await assertCsrf(request);
    const body = await readJsonBody(request);

    if (!isRecord(body)) {
      throw new ApiHttpError("รูปแบบคำขอไม่ถูกต้อง", 400);
    }

    const action = readStringField(body, "action");

    if (action === "reset") {
      const gasResponse = await gasPost<{ cleared: number }>({ action: "reset" });
      return proxyGasResponse(gasResponse);
    }

    if (action === "import") {
      const rows = importRowsSchema.parse(body.rows);
      const gasResponse = await gasPost<ImportResult>({
        action: "import",
        rows,
      });
      return proxyGasResponse(gasResponse);
    }

    throw new ApiHttpError("ไม่รู้จัก action", 400);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
