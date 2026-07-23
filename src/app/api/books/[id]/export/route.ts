import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { mapPhotobook, mapPhoto, mapPage, BOOK_SELECT_SQL, PHOTO_SELECT_SQL, PAGE_SELECT_SQL } from "@/lib/mappers";
import { generateBookPdf } from "@/lib/pdf-export";

function slugify(title: string): string {
  return (
    title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "fotolibro"
  );
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

  const bookResult = await query(`${BOOK_SELECT_SQL} WHERE b.id = $1`, [id]);
  const row = bookResult.rows[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!row || (row as any).user_id !== session.sub) {
    return NextResponse.json({ error: "Fotolibro no encontrado" }, { status: 404 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = mapPhotobook(row as any);

  const pagesResult = await query(
    `${PAGE_SELECT_SQL} WHERE book_id = $1 ORDER BY position ASC, created_at ASC`,
    [id]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages = pagesResult.rows.map((r) => mapPage(r as any));

  if (pages.length === 0) {
    return NextResponse.json(
      { error: "Agrega al menos una página con fotos antes de exportar" },
      { status: 400 }
    );
  }

  const photosResult = await query(
    `${PHOTO_SELECT_SQL} WHERE book_id = $1 ORDER BY position ASC, created_at ASC`,
    [id]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos = photosResult.rows.map((r) => mapPhoto(r as any));

  const pdfBytes = await generateBookPdf(book, pages, photos);

  return new NextResponse(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slugify(book.title)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
