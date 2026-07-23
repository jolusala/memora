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
  onDropPhoto: (photoId: string) => void;
  onSetCover: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
  onCaptionBlur: (photo: Photo, caption: string) => void;
  onRemoveFromPage: (photo: Photo) => void;
  onDragStart: (photo: Photo) => void;
  onDragEnd: () => void;
}) {
  const [isOver, setIsOver] = useState(false);

  if (photo) {
    return (
      <div className={className}>
        <PhotoThumb
          photo={photo}
          isCover={photo.id === coverPhotoId}
          isDragging={draggingPhotoId === photo.id}
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
        if (photoId) onDropPhoto(photoId);
      }}
      className={cn(
        "flex items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        isOver ? "border-accent bg-accent/10" : "border-border bg-muted/50",
        className
      )}
    >
      <ImagePlus
        className={cn("h-6 w-6", isOver ? "text-accent" : "text-muted-foreground/50")}
        aria-hidden="true"
      />
    </div>
  );
}
