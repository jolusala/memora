import { getSessionUser } from "@/lib/session";
import { query } from "@/lib/db";
import { mapPhotobook, BOOK_SELECT_SQL } from "@/lib/mappers";
import { PhotobookGrid } from "@/components/dashboard/photobook-grid";
import { CreateBookDialog } from "@/components/dashboard/create-book-dialog";
import type { Photobook } from "@/types";

export const metadata = {
  title: "Tus fotolibros — Memora",
};

export default async function DashboardPage() {
  const session = await getSessionUser();

  const result = await query(
    `${BOOK_SELECT_SQL} WHERE b.user_id = $1 ORDER BY b.updated_at DESC`,
    [session!.sub]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const books: Photobook[] = result.rows.map((r) => mapPhotobook(r as any));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Tus fotolibros
          </h1>
          <p className="mt-1 text-muted-foreground">
            {books.length > 0
              ? "Elige un fotolibro para verlo o seguir agregando fotos."
              : "Crea tu primer fotolibro para empezar."}
          </p>
        </div>
        {books.length > 0 ? <CreateBookDialog /> : null}
      </div>

      <PhotobookGrid books={books} />
    </div>
  );
}
