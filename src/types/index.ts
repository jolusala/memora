export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface Photo {
  id: string;
  bookId: string;
  filename: string;
  originalName: string | null;
  caption: string | null;
  position: number;
  url: string;
  createdAt: string;
}

export interface Photobook {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  coverPhotoId: string | null;
  coverUrl: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}
