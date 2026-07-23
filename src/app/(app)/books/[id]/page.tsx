import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { query } from "@/lib/db";
import { mapPhotobook, mapPhoto } from "@/lib/mappers";
import { BookHeader } from "@/components/book/book-header";
import { BookEditor } from "@/components/book/book-editor";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionUser();

  const bookResult = await query(
    `SELECT b.id, b.user_id, b.title, b.description, b.cover_photo_id,
            b.created_at, b.updated_at,
            p.filename AS cover_filename,
            (SELECT count(*) FROM photos ph WHERE ph.book_id = b.id) AS photo_count
     FROM photobooks b
     LEFT JOIN photos p ON p.id = b.cover_photo_id
     WHERE b.id = $1`,
    [id]
  );

  const row = bookResult.rows[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!row || (row as any).user_id !== session!.sub) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = mapPhotobook(row as any);

  const photosResult = await query(
    `SELECT id, book_id, filename, original_name, caption, position, created_at
     FROM photos WHERE book_id = $1 ORDER BY position ASC, created_at ASC`,
    [id]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos = photosResult.rows.map((r) => mapPhoto(r as any));

  return (
    <div className="space-y-8">
      <BookHeader book={book} />
      <BookEditor book={book} initialPhotos={photos} />
    </div>
  );
}
