import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { googleOAuthEnabled, buildGoogleAuthUrl } from "@/lib/google-oauth";

export async function GET() {
  if (!googleOAuthEnabled()) {
    return NextResponse.json(
      { error: "El login con Google no está configurado" },
      { status: 501 }
    );
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(state));
  response.cookies.set("memora_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
