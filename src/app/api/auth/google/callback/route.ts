import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { signSession } from "@/lib/auth";
import { setAuthCookie } from "@/lib/auth-cookie";
import { googleOAuthEnabled, exchangeGoogleCode } from "@/lib/google-oauth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (!googleOAuthEnabled()) {
    return NextResponse.redirect(`${origin}/login?error=google_disabled`);
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("picbook_oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${origin}/login?error=google_state`);
  }

  try {
    const profile = await exchangeGoogleCode(code);
    if (!profile.email_verified) {
      return NextResponse.redirect(`${origin}/login?error=google_unverified`);
    }

    const existing = await query<{
      id: string;
      email: string;
      name: string;
    }>(`SELECT id, email, name FROM users WHERE google_id = $1 OR email = $2`, [
      profile.sub,
      profile.email,
    ]);

    let user = existing.rows[0];
    if (!user) {
      const inserted = await query<{ id: string; email: string; name: string }>(
        `INSERT INTO users (email, name, google_id, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name`,
        [profile.email, profile.name, profile.sub, profile.picture ?? null]
      );
      user = inserted.rows[0];
    } else {
      await query(
        `UPDATE users SET google_id = $1, avatar_url = COALESCE($2, avatar_url) WHERE id = $3`,
        [profile.sub, profile.picture ?? null, user.id]
      );
    }

    const token = await signSession({ sub: user.id, email: user.email, name: user.name });
    const response = NextResponse.redirect(`${origin}/dashboard`);
    setAuthCookie(response, token);
    response.cookies.set("picbook_oauth_state", "", { path: "/", maxAge: 0 });
    return response;
  } catch (err) {
    console.error("Google OAuth error", err);
    return NextResponse.redirect(`${origin}/login?error=google_failed`);
  }
}
