import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { query } from "@/lib/db";
import {
  mapPhotobook,
  mapPhoto,
  mapPage,
  BOOK_SELECT_SQL,
  PHOTO_SELECT_SQL,
  PAGE_SELECT_SQL,
} from "@/lib/mappers";
import { BookHeader } from "@/components/book/book-header";
import { BookEditor } from "@/components/book/book-editor";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionUser();

  const bookResult = await query(`${BOOK_SELECT_SQL} WHERE b.id = $1`, [id]);

  const row = bookResult.rows[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!row || (row as any).user_id !== session!.sub) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = mapPhotobook(row as any);

  const photosResult = await query(
    `${PHOTO_SELECT_SQL} WHERE book_id = $1 ORDER BY position ASC, created_at ASC`,
    [id]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos = photosResult.rows.map((r) => mapPhoto(r as any));

  const pagesResult = await query(
    `${PAGE_SELECT_SQL} WHERE book_id = $1 ORDER BY position ASC, created_at ASC`,
    [id]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages = pagesResult.rows.map((r) => mapPage(r as any));

  return (
    <div className="space-y-8">
      <BookHeader book={book} />
      <BookEditor book={book} initialPhotos={photos} initialPages={pages} />
    </div>
  );
}
