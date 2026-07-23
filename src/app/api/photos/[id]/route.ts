import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query, withTransaction } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { deleteUploadedFile } from "@/lib/uploads";
import { PAGE_LAYOUTS, isLayoutId } from "@/lib/layouts";

async function getOwnedPhoto(photoId: string, userId: string) {
  const result = await query<{
    id: string;
    book_id: string;
    filename: string;
    page_id: string | null;
    slot: number | null;
    user_id: string;
  }>(
    `SELECT p.id, p.book_id, p.filename, p.page_id, p.slot, b.user_id
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
  caption: z.string().trim().max(500).nullable().optional(),
  pageId: z.string().uuid().nullable().optional(),
  slot: z.number().int().min(0).max(3).nullable().optional(),
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

  if (parsed.data.caption !== undefined) {
    await query(`UPDATE photos SET caption = $1 WHERE id = $2`, [parsed.data.caption, id]);
  }

  if (parsed.data.pageId !== undefined) {
    if (parsed.data.pageId === null) {
      await query(`UPDATE photos SET page_id = NULL, slot = NULL WHERE id = $1`, [id]);
    } else {
      if (parsed.data.slot === undefined || parsed.data.slot === null) {
        return NextResponse.json(
          { error: "Falta la posición dentro de la página" },
          { status: 400 }
        );
      }

      const pageResult = await query<{ id: string; book_id: string; layout: string }>(
        `SELECT id, book_id, layout FROM pages WHERE id = $1`,
        [parsed.data.pageId]
      );
      const page = pageResult.rows[0];
      if (!page || page.book_id !== photo.book_id) {
        return NextResponse.json({ error: "Página inválida" }, { status: 400 });
      }
      const layout = isLayoutId(page.layout) ? page.layout : "single";
      if (parsed.data.slot >= PAGE_LAYOUTS[layout].slots) {
        return NextResponse.json(
          { error: "Esa posición no existe en esta página" },
          { status: 400 }
        );
      }

      const targetPageId = parsed.data.pageId;
      const targetSlot = parsed.data.slot;

      await withTransaction(async (client) => {
        const occupant = await client.query<{ id: string }>(
          `SELECT id FROM photos WHERE page_id = $1 AND slot = $2 AND id != $3`,
          [targetPageId, targetSlot, id]
        );

        // Vacate this photo's current slot first to avoid transient collisions.
        await client.query(`UPDATE photos SET page_id = NULL, slot = NULL WHERE id = $1`, [
          id,
        ]);

        if (occupant.rows[0]) {
          await client.query(`UPDATE photos SET page_id = $1, slot = $2 WHERE id = $3`, [
            photo.page_id,
            photo.slot,
            occupant.rows[0].id,
          ]);
        }

        await client.query(`UPDATE photos SET page_id = $1, slot = $2 WHERE id = $3`, [
          targetPageId,
          targetSlot,
          id,
        ]);
      });
    }
  }

  await query(`UPDATE photobooks SET updated_at = now() WHERE id = $1`, [photo.book_id]);

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
