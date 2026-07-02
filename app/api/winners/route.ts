import { NextResponse } from "next/server";

import type { Registrant } from "@/types/registration";

import { gasGet } from "@/lib/server/gas";
import { proxyGasResponse, routeErrorResponse } from "@/lib/server/response";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const gasResponse = await gasGet<Registrant[]>("winners");
    return proxyGasResponse(gasResponse);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
