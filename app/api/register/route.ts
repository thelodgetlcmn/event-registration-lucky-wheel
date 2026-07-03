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
    console.log("STEP 1");

    await assertCsrf(request);

    console.log("STEP 2");

    const body = await readJsonBody(request);

    console.log("STEP 3", body);

    const input = registrationSchema.parse(body);

    console.log("STEP 4");

    const gasResponse = await gasPost<Registrant>({
      action: "register",
      ...input,
    });

    console.log("STEP 5");

    return proxyGasResponse(gasResponse);
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return routeErrorResponse(error);
  }
}