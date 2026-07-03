import { NextResponse } from "next/server";

import type { Registrant } from "@/types/registration";

import { gasPost } from "@/lib/server/gas";
import { readJsonBody } from "@/lib/server/request";
import { proxyGasResponse, routeErrorResponse } from "@/lib/server/response";
import { assertCsrf } from "@/lib/server/csrf";
import { registrationSchema } from "@/utils/validation";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await assertCsrf(request);
    const body = await readJsonBody(request);
    const input = registrationSchema.parse(body);
    const gasResponse = await gasPost<Registrant>({
      action: "register",
      ...input,
    });

    return proxyGasResponse(gasResponse);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
