"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoThumb } from "@/components/book/photo-thumb";
import type { Photo } from "@/types";

export function PhotoPool({
  photos,
  coverPhotoId,
  draggingPhotoId,
  onDropUnassigned,
  onSetCover,
  onDelete,
  onCaptionBlur,
  onDragStart,
  onDragEnd,
}: {
  photos: Photo[];
  coverPhotoId: string | null;
  draggingPhotoId: string | null;
  onDropUnassigned: (photoId: string) => void;
  onSetCover: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
  onCaptionBlur: (photo: Photo, caption: string) => void;
  onDragStart: (photo: Photo) => void;
  onDragEnd: () => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const photoId = e.dataTransfer.getData("text/plain");
        if (photoId) onDropUnassigned(photoId);
      }}
      className={cn(
        "rounded-xl border-2 border-dashed p-3 transition-colors",
        isOver ? "border-accent bg-accent/10" : "border-transparent"
      )}
    >
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
          <ImageOff className="h-6 w-6" aria-hidden="true" />
          <p className="text-sm">
            Todas tus fotos están usadas en páginas. Sube más o quita alguna de una página.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          <AnimatePresence>
            {photos.map((photo) => (
              <PhotoThumb
                key={photo.id}
                photo={photo}
                isCover={photo.id === coverPhotoId}
                isDragging={draggingPhotoId === photo.id}
                onSetCover={onSetCover}
                onDelete={onDelete}
                onCaptionBlur={onCaptionBlur}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
