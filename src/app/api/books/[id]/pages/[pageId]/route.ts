import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query, withTransaction } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { LAYOUT_ORDER, PAGE_LAYOUTS, isLayoutId } from "@/lib/layouts";

async function getOwnedPage(bookId: string, pageId: string, userId: string) {
  const result = await query<{
    id: string;
    book_id: string;
    layout: string;
    position: number;
    user_id: string;
  }>(
    `SELECT p.id, p.book_id, p.layout, p.position, b.user_id
     FROM pages p
     JOIN photobooks b ON b.id = p.book_id
     WHERE p.id = $1 AND p.book_id = $2`,
    [pageId, bookId]
  );
  const page = result.rows[0];
  if (!page || page.user_id !== userId) return null;
  return page;
}

const updateSchema = z.object({
  layout: z.enum(LAYOUT_ORDER as [string, ...string[]]).optional(),
  direction: z.enum(["up", "down"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id: bookId, pageId } = await params;

  const page = await getOwnedPage(bookId, pageId, session.sub);
  if (!page) {
    return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.layout && isLayoutId(parsed.data.layout)) {
    const maxSlots = PAGE_LAYOUTS[parsed.data.layout].slots;
    await withTransaction(async (client) => {
      await client.query(`UPDATE pages SET layout = $1 WHERE id = $2`, [
        parsed.data.layout,
        pageId,
      ]);
      await client.query(
        `UPDATE photos SET page_id = NULL, slot = NULL WHERE page_id = $1 AND slot >= $2`,
        [pageId, maxSlots]
      );
    });
  }

  if (parsed.data.direction) {
    const neighbor = await query<{ id: string; position: number }>(
      `SELECT id, position FROM pages
       WHERE book_id = $1 AND position ${parsed.data.direction === "up" ? "<" : ">"} $2
       ORDER BY position ${parsed.data.direction === "up" ? "DESC" : "ASC"}
       LIMIT 1`,
      [bookId, page.position]
    );
    const other = neighbor.rows[0];
    if (other) {
      await withTransaction(async (client) => {
        await client.query(`UPDATE pages SET position = $1 WHERE id = $2`, [
          other.position,
          pageId,
        ]);
        await client.query(`UPDATE pages SET position = $1 WHERE id = $2`, [
          page.position,
          other.id,
        ]);
      });
    }
  }

  await query(`UPDATE photobooks SET updated_at = now() WHERE id = $1`, [bookId]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id: bookId, pageId } = await params;

  const page = await getOwnedPage(bookId, pageId, session.sub);
  if (!page) {
    return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
  }

  await query(`DELETE FROM pages WHERE id = $1`, [pageId]);
  await query(`UPDATE photobooks SET updated_at = now() WHERE id = $1`, [bookId]);

  return NextResponse.json({ ok: true });
}
