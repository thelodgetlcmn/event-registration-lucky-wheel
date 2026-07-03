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
    console.log("1");

    await assertCsrf(request);

    console.log("2");

    const body = await readJsonBody(request);

    console.log("3");

    const input = registrationSchema.parse(body);

    console.log("4");

    const gasResponse = await gasPost({
      action: "register",
      ...input,
    });

    console.log("5");

    return proxyGasResponse(gasResponse);
  } catch (error) {
    console.error(error);
    return routeErrorResponse(error);
  }
}