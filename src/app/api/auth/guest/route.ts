import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { signSession } from "@/lib/auth";
import { setAuthCookie } from "@/lib/auth-cookie";
import type { PublicUser } from "@/types";

export async function POST() {
  const email = `guest-${randomUUID()}@guest.picbook.local`;

  const result = await query<{
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  }>(
    `INSERT INTO users (email, name, is_guest)
     VALUES ($1, $2, true)
     RETURNING id, email, name, avatar_url`,
    [email, "Invitado"]
  );
  const user = result.rows[0];

  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  const publicUser: PublicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    isGuest: true,
  };

  const response = NextResponse.json({ user: publicUser }, { status: 201 });
  setAuthCookie(response, token);
  return response;
}
