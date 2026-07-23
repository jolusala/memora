import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { mapPhotobook, BOOK_SELECT_SQL } from "@/lib/mappers";
import { BOOK_TEMPLATES } from "@/lib/book-templates";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const result = await query(
    `${BOOK_SELECT_SQL} WHERE b.user_id = $1 ORDER BY b.updated_at DESC`,
    [session.sub]
  );

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    books: result.rows.map((r) => mapPhotobook(r as any)),
  });
}

const createSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(200),
  description: z.string().trim().max(2000).optional(),
  template: z
    .enum(BOOK_TEMPLATES.map((t) => t.id) as [string, ...string[]])
    .optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const result = await query(
    `INSERT INTO photobooks (user_id, title, description, template)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, title, description, template, cover_photo_id, created_at, updated_at`,
    [
      session.sub,
      parsed.data.title,
      parsed.data.description ?? null,
      parsed.data.template ?? "custom",
    ]
  );

  const book = mapPhotobook({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(result.rows[0] as any),
    cover_filename: null,
    photo_count: 0,
  });

  return NextResponse.json({ book }, { status: 201 });
}
