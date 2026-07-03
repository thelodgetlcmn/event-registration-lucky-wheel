import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return NextResponse.json(
      { message: "ADMIN_PASSWORD is not configured" },
      { status: 500 },
    );
  }

  if (body.password !== password) {
    return NextResponse.json(
      { message: "Password incorrect" },
      { status: 401 },
    );
  }

  (await cookies()).set("admin-session", "logged-in", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({
    success: true,
  });
}