import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession, type SessionPayload } from "@/lib/auth";

export async function getSessionUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
