import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { signSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { setAuthCookie } from "@/lib/auth-cookie";
import type { PublicUser } from "@/types";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  const result = await query<{
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    password_hash: string | null;
  }>(
    `SELECT id, email, name, avatar_url, password_hash FROM users WHERE email = $1`,
    [email]
  );
  const user = result.rows[0];

  if (!user || !user.password_hash) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  const publicUser: PublicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
  };

  const response = NextResponse.json({ user: publicUser });
  setAuthCookie(response, token);
  return response;
}
