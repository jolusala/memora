import type { Page, Photo, Photobook } from "@/types";
import { getBookTemplate } from "@/lib/book-templates";
import { isLayoutId } from "@/lib/layouts";

export function uploadUrl(filename: string): string {
  return `/api/uploads/${filename}`;
}

export const BOOK_SELECT_SQL = `
  SELECT b.id, b.user_id, b.title, b.description, b.template, b.cover_photo_id,
         b.created_at, b.updated_at,
         p.filename AS cover_filename,
         (SELECT count(*) FROM photos ph WHERE ph.book_id = b.id) AS photo_count
  FROM photobooks b
  LEFT JOIN photos p ON p.id = b.cover_photo_id
`;

export const PHOTO_SELECT_SQL = `
  SELECT id, book_id, page_id, slot, filename, original_name, caption, position, created_at
  FROM photos
`;

export const PAGE_SELECT_SQL = `
  SELECT id, book_id, layout, position, created_at
  FROM pages
`;

interface PhotobookRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  template: string;
  cover_photo_id: string | null;
  cover_filename: string | null;
  photo_count: string | number;
  created_at: string | Date;
  updated_at: string | Date;
}

export function mapPhotobook(row: PhotobookRow): Photobook {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    template: getBookTemplate(row.template).id,
    coverPhotoId: row.cover_photo_id,
    coverUrl: row.cover_filename ? uploadUrl(row.cover_filename) : null,
    photoCount: Number(row.photo_count),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

interface PhotoRow {
  id: string;
  book_id: string;
  page_id: string | null;
  slot: number | null;
  filename: string;
  original_name: string | null;
  caption: string | null;
  position: number;
  created_at: string | Date;
}

export function mapPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    bookId: row.book_id,
    pageId: row.page_id,
    slot: row.slot,
    filename: row.filename,
    originalName: row.original_name,
    caption: row.caption,
    position: row.position,
    url: uploadUrl(row.filename),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

interface PageRow {
  id: string;
  book_id: string;
  layout: string;
  position: number;
  created_at: string | Date;
}

export function mapPage(row: PageRow): Page {
  return {
    id: row.id,
    bookId: row.book_id,
    layout: isLayoutId(row.layout) ? row.layout : "single",
    position: row.position,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
