"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoThumb } from "@/components/book/photo-thumb";
import type { Photo } from "@/types";

export function PhotoSlot({
  className,
  photo,
  coverPhotoId,
  draggingPhotoId,
  selectedPhotoId,
  onSelectPhoto,
  onDropPhoto,
  onSetCover,
  onDelete,
  onCaptionBlur,
  onRemoveFromPage,
  onDragStart,
  onDragEnd,
}: {
  className?: string;
  photo: Photo | undefined;
  coverPhotoId: string | null;
  draggingPhotoId: string | null;
  selectedPhotoId: string | null;
  onSelectPhoto: (photoId: string | null) => void;
  onDropPhoto: (photoId: string) => void;
  onSetCover: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
  onCaptionBlur: (photo: Photo, caption: string) => void;
  onRemoveFromPage: (photo: Photo) => void;
  onDragStart: (photo: Photo) => void;
  onDragEnd: () => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const hasOtherSelection = Boolean(selectedPhotoId && selectedPhotoId !== photo?.id);

  if (photo) {
    return (
      <div className={cn("h-full w-full", className)}>
        <PhotoThumb
          photo={photo}
          isCover={photo.id === coverPhotoId}
          isDragging={draggingPhotoId === photo.id}
          isSelected={selectedPhotoId === photo.id}
          fillContainer
          onActivate={() => {
            if (hasOtherSelection && selectedPhotoId) {
              onDropPhoto(selectedPhotoId);
              onSelectPhoto(null);
            } else {
              onSelectPhoto(selectedPhotoId === photo.id ? null : photo.id);
            }
          }}
          onSetCover={onSetCover}
          onDelete={onDelete}
          onCaptionBlur={onCaptionBlur}
          onRemoveFromPage={onRemoveFromPage}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (selectedPhotoId) {
          onDropPhoto(selectedPhotoId);
          onSelectPhoto(null);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const photoId = e.dataTransfer.getData("text/plain");
        if (photoId) onDropPhoto(photoId);
      }}
      aria-label={selectedPhotoId ? "Colocar la foto seleccionada aquí" : "Casilla vacía"}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        isOver || selectedPhotoId
          ? "cursor-pointer border-accent bg-accent/10"
          : "border-border bg-muted/50",
        className
      )}
    >
      <ImagePlus
        className={cn(
          "h-6 w-6",
          isOver || selectedPhotoId ? "text-accent" : "text-muted-foreground/50"
        )}
        aria-hidden="true"
      />
    </button>
  );
}
