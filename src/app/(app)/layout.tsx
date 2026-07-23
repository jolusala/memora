import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { query } from "@/lib/db";
import { Navbar } from "@/components/navbar";
import type { PublicUser } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const result = await query<{
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  }>(`SELECT id, email, name, avatar_url FROM users WHERE id = $1`, [session.sub]);

  const row = result.rows[0];
  if (!row) {
    redirect("/login");
  }

  const user: PublicUser = {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar user={user} />
      <main className="container py-8">{children}</main>
    </div>
  );
}
