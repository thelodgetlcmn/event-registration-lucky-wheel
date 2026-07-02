import { NextResponse } from "next/server";

import type { Registrant } from "@/types/registration";

import { assertCsrf } from "@/lib/server/csrf";
import { gasPost } from "@/lib/server/gas";
import { proxyGasResponse, routeErrorResponse } from "@/lib/server/response";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await assertCsrf(request);
    const gasResponse = await gasPost<Registrant>({
      action: "drawWinner",
    });

    return proxyGasResponse(gasResponse);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
