import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { signSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { setAuthCookie } from "@/lib/auth-cookie";
import type { PublicUser } from "@/types";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
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
  const { name, email, password } = parsed.data;

  const existing = await query(`SELECT id FROM users WHERE email = $1`, [email]);
  if (existing.rowCount) {
    return NextResponse.json({ error: "Ese email ya está registrado" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const result = await query<{
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  }>(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, avatar_url`,
    [email, passwordHash, name]
  );
  const user = result.rows[0];

  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  const publicUser: PublicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
  };

  const response = NextResponse.json({ user: publicUser }, { status: 201 });
  setAuthCookie(response, token);
  return response;
}
