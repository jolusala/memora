import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { deleteUploadedFile } from "@/lib/uploads";

async function getOwnedPhoto(photoId: string, userId: string) {
  const result = await query<{
    id: string;
    book_id: string;
    filename: string;
    user_id: string;
  }>(
    `SELECT p.id, p.book_id, p.filename, b.user_id
     FROM photos p
     JOIN photobooks b ON b.id = p.book_id
     WHERE p.id = $1`,
    [photoId]
  );
  const photo = result.rows[0];
  if (!photo || photo.user_id !== userId) return null;
  return photo;
}

const updateSchema = z.object({
  caption: z.string().trim().max(500).nullable(),
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

  const photo = await getOwnedPhoto(id, session.sub);
  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await query(`UPDATE photos SET caption = $1 WHERE id = $2`, [parsed.data.caption, id]);
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

  const photo = await getOwnedPhoto(id, session.sub);
  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  await query(`DELETE FROM photos WHERE id = $1`, [id]);

  const remainingCover = await query<{ cover_photo_id: string | null }>(
    `SELECT cover_photo_id FROM photobooks WHERE id = $1`,
    [photo.book_id]
  );
  if (remainingCover.rows[0]?.cover_photo_id === null) {
    const nextCover = await query<{ id: string }>(
      `SELECT id FROM photos WHERE book_id = $1 ORDER BY position ASC LIMIT 1`,
      [photo.book_id]
    );
    if (nextCover.rows[0]) {
      await query(`UPDATE photobooks SET cover_photo_id = $1 WHERE id = $2`, [
        nextCover.rows[0].id,
        photo.book_id,
      ]);
    }
  }

  await deleteUploadedFile(photo.filename);

  return NextResponse.json({ ok: true });
}
