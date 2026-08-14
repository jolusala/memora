import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { query } from "@/lib/db";
import type { PublicUser } from "@/types";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const result = await query<{
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    is_guest: boolean;
  }>(`SELECT id, email, name, avatar_url, is_guest FROM users WHERE id = $1`, [session.sub]);

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const publicUser: PublicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    isGuest: user.is_guest,
  };
  return NextResponse.json({ user: publicUser });
}
