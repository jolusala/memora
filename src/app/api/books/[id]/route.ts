import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import {
  mapPhotobook,
  mapPhoto,
  mapPage,
  BOOK_SELECT_SQL,
  PHOTO_SELECT_SQL,
  PAGE_SELECT_SQL,
} from "@/lib/mappers";
import { deleteUploadedFile } from "@/lib/uploads";

async function getOwnedBook(bookId: string, userId: string) {
  const result = await query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM photobooks WHERE id = $1`,
    [bookId]
  );
  const book = result.rows[0];
  if (!book || book.user_id !== userId) return null;
  return book;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id } = await params;

  const owned = await getOwnedBook(id, session.sub);
  if (!owned) {
    return NextResponse.json({ error: "Fotolibro no encontrado" }, { status: 404 });
  }

  const bookResult = await query(`${BOOK_SELECT_SQL} WHERE b.id = $1`, [id]);

  const photosResult = await query(
    `${PHOTO_SELECT_SQL} WHERE book_id = $1 ORDER BY position ASC, created_at ASC`,
    [id]
  );

  const pagesResult = await query(
    `${PAGE_SELECT_SQL} WHERE book_id = $1 ORDER BY position ASC, created_at ASC`,
    [id]
  );

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    book: mapPhotobook(bookResult.rows[0] as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    photos: photosResult.rows.map((r) => mapPhoto(r as any)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pages: pagesResult.rows.map((r) => mapPage(r as any)),
  });
}

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  coverPhotoId: z.string().uuid().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id } = await params;

  const owned = await getOwnedBook(id, session.sub);
  if (!owned) {
    return NextResponse.json({ error: "Fotolibro no encontrado" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  if (parsed.data.coverPhotoId) {
    const photoCheck = await query(`SELECT id FROM photos WHERE id = $1 AND book_id = $2`, [
      parsed.data.coverPhotoId,
      id,
    ]);
    if (!photoCheck.rowCount) {
      return NextResponse.json({ error: "Foto de portada inválida" }, { status: 400 });
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (parsed.data.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(parsed.data.title);
  }
  if (parsed.data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(parsed.data.description);
  }
  if (parsed.data.coverPhotoId !== undefined) {
    fields.push(`cover_photo_id = $${idx++}`);
    values.push(parsed.data.coverPhotoId);
  }
  fields.push(`updated_at = now()`);

  values.push(id);
  await query(
    `UPDATE photobooks SET ${fields.join(", ")} WHERE id = $${idx}`,
    values
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id } = await params;

  const owned = await getOwnedBook(id, session.sub);
  if (!owned) {
    return NextResponse.json({ error: "Fotolibro no encontrado" }, { status: 404 });
  }

  const photos = await query<{ filename: string }>(
    `SELECT filename FROM photos WHERE book_id = $1`,
    [id]
  );

  await query(`DELETE FROM photobooks WHERE id = $1`, [id]);

  await Promise.all(photos.rows.map((p) => deleteUploadedFile(p.filename)));

  return NextResponse.json({ ok: true });
}
