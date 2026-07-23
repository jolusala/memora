import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { mapPhoto } from "@/lib/mappers";
import { saveUploadedFile, UploadError } from "@/lib/uploads";

async function assertOwnedBook(bookId: string, userId: string) {
  const result = await query<{ id: string; user_id: string; cover_photo_id: string | null }>(
    `SELECT id, user_id, cover_photo_id FROM photobooks WHERE id = $1`,
    [bookId]
  );
  const book = result.rows[0];
  if (!book || book.user_id !== userId) return null;
  return book;
}

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

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Formulario inválido" }, { status: 400 });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No se recibió ninguna imagen" }, { status: 400 });
  }

  const posResult = await query<{ max: number | null }>(
    `SELECT MAX(position) AS max FROM photos WHERE book_id = $1`,
    [bookId]
  );
  let nextPosition = (posResult.rows[0]?.max ?? -1) + 1;

  const created = [];
  for (const file of files) {
    let saved;
    try {
      saved = await saveUploadedFile(file);
    } catch (err) {
      if (err instanceof UploadError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    const inserted = await query(
      `INSERT INTO photos (book_id, filename, original_name, position)
       VALUES ($1, $2, $3, $4)
       RETURNING id, book_id, filename, original_name, caption, position, created_at`,
      [bookId, saved.filename, saved.originalName, nextPosition++]
    );
    created.push(inserted.rows[0]);
  }

  if (!book.cover_photo_id && created.length > 0) {
    await query(`UPDATE photobooks SET cover_photo_id = $1 WHERE id = $2`, [
      created[0].id,
      bookId,
    ]);
  }
  await query(`UPDATE photobooks SET updated_at = now() WHERE id = $1`, [bookId]);

  return NextResponse.json(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { photos: created.map((r) => mapPhoto(r as any)) },
    { status: 201 }
  );
}

const reorderSchema = z.object({
  order: z.array(z.string().uuid()).min(1),
});

export async function PATCH(
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

  const body = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const owned = await query<{ id: string }>(
    `SELECT id FROM photos WHERE book_id = $1`,
    [bookId]
  );
  const ownedIds = new Set(owned.rows.map((r) => r.id));
  if (!parsed.data.order.every((photoId) => ownedIds.has(photoId))) {
    return NextResponse.json({ error: "El orden incluye fotos inválidas" }, { status: 400 });
  }

  await Promise.all(
    parsed.data.order.map((photoId, index) =>
      query(`UPDATE photos SET position = $1 WHERE id = $2`, [index, photoId])
    )
  );
  await query(`UPDATE photobooks SET updated_at = now() WHERE id = $1`, [bookId]);

  return NextResponse.json({ ok: true });
}
