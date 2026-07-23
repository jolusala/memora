import type { BookTemplateId } from "@/lib/book-templates";
import type { LayoutId } from "@/lib/layouts";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface Photo {
  id: string;
  bookId: string;
  pageId: string | null;
  slot: number | null;
  filename: string;
  originalName: string | null;
  caption: string | null;
  position: number;
  url: string;
  createdAt: string;
}

export interface Page {
  id: string;
  bookId: string;
  layout: LayoutId;
  position: number;
  createdAt: string;
}

export interface Photobook {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  template: BookTemplateId;
  coverPhotoId: string | null;
  coverUrl: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}
