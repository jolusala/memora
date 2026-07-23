"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder } from "motion/react";
import { toast } from "sonner";
import { ImageOff } from "lucide-react";
import { UploadDropzone } from "@/components/book/upload-dropzone";
import { PhotoItem } from "@/components/book/photo-item";
import type { Photo, Photobook } from "@/types";

export function BookEditor({
  book,
  initialPhotos,
}: {
  book: Photobook;
  initialPhotos: Photo[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [coverPhotoId, setCoverPhotoId] = useState(book.coverPhotoId);

  function handleUploaded(newPhotos: Photo[]) {
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (!coverPhotoId && newPhotos[0]) {
      setCoverPhotoId(newPhotos[0].id);
    }
    router.refresh();
  }

  async function handleReorder(newOrder: Photo[]) {
    setPhotos(newOrder);
    await fetch(`/api/books/${book.id}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder.map((p) => p.id) }),
    }).catch(() => undefined);
  }

  async function handleDelete(photo: Photo) {
    const previous = photos;
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    const res = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" }).catch(
      () => null
    );
    if (!res || !res.ok) {
      setPhotos(previous);
      toast.error("No se pudo eliminar la foto");
      return;
    }
    if (coverPhotoId === photo.id) {
      const next = previous.find((p) => p.id !== photo.id);
      setCoverPhotoId(next?.id ?? null);
    }
    router.refresh();
  }

  async function handleSetCover(photo: Photo) {
    const previous = coverPhotoId;
    setCoverPhotoId(photo.id);
    const res = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverPhotoId: photo.id }),
    }).catch(() => null);
    if (!res || !res.ok) {
      setCoverPhotoId(previous);
      toast.error("No se pudo actualizar la portada");
      return;
    }
    toast.success("Portada actualizada");
    router.refresh();
  }

  async function handleCaptionBlur(photo: Photo, caption: string) {
    await fetch(`/api/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: caption || null }),
    }).catch(() => undefined);
  }

  return (
    <div className="space-y-8">
      <UploadDropzone bookId={book.id} onUploaded={handleUploaded} />

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          <ImageOff className="h-8 w-8" aria-hidden="true" />
          <p className="mt-3 text-sm">Todavía no hay fotos en este fotolibro.</p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Arrastrá las fotos para ordenarlas. Pasá el cursor sobre una foto para marcarla
            como portada o eliminarla.
          </p>
          <Reorder.Group
            axis="y"
            values={photos}
            onReorder={handleReorder}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {photos.map((photo) => (
              <PhotoItem
                key={photo.id}
                photo={photo}
                isCover={photo.id === coverPhotoId}
                onDelete={handleDelete}
                onSetCover={handleSetCover}
                onCaptionBlur={handleCaptionBlur}
              />
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
