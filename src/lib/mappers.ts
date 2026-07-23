import type { Photo, Photobook } from "@/types";

export function uploadUrl(filename: string): string {
  return `/api/uploads/${filename}`;
}

interface PhotobookRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
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
    filename: row.filename,
    originalName: row.original_name,
    caption: row.caption,
    position: row.position,
    url: uploadUrl(row.filename),
    createdAt: new Date(row.created_at).toISOString(),
  };
}
