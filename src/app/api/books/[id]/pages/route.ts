import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { mapPage } from "@/lib/mappers";
import { LAYOUT_ORDER } from "@/lib/layouts";

async function assertOwnedBook(bookId: string, userId: string) {
  const result = await query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM photobooks WHERE id = $1`,
    [bookId]
  );
  const book = result.rows[0];
  if (!book || book.user_id !== userId) return null;
  return book;
}

const createSchema = z.object({
  layout: z.enum(LAYOUT_ORDER as [string, ...string[]]).default("single"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id: bookId } = await params;

  const book = await assertOwnedBook(bookId, session.sub);
  if (!book) {
    return NextResponse.json({ error: "Fotolibro no encontrado" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const posResult = await query<{ max: number | null }>(
    `SELECT MAX(position) AS max FROM pages WHERE book_id = $1`,
    [bookId]
  );
  const nextPosition = (posResult.rows[0]?.max ?? -1) + 1;

  const inserted = await query(
    `INSERT INTO pages (book_id, layout, position)
     VALUES ($1, $2, $3)
     RETURNING id, book_id, layout, position, created_at`,
    [bookId, parsed.data.layout, nextPosition]
  );
  await query(`UPDATE photobooks SET updated_at = now() WHERE id = $1`, [bookId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json({ page: mapPage(inserted.rows[0] as any) }, { status: 201 });
}
