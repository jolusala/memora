"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types";

export function PhotoThumb({
  photo,
  isCover,
  isDragging,
  onSetCover,
  onDelete,
  onCaptionBlur,
  onRemoveFromPage,
  onDragStart,
  onDragEnd,
}: {
  photo: Photo;
  isCover: boolean;
  isDragging?: boolean;
  onSetCover: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
  onCaptionBlur: (photo: Photo, caption: string) => void;
  onRemoveFromPage?: (photo: Photo) => void;
  onDragStart: (photo: Photo) => void;
  onDragEnd: () => void;
}) {
  const [caption, setCaption] = useState(photo.caption ?? "");

  return (
    <motion.div
      layoutId={`photo-${photo.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.4 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      draggable
      onDragStart={(e) => {
        (e as unknown as React.DragEvent).dataTransfer.setData("text/plain", photo.id);
        (e as unknown as React.DragEvent).dataTransfer.effectAllowed = "move";
        onDragStart(photo);
      }}
      onDragEnd={onDragEnd}
      className="group relative aspect-square w-full cursor-grab overflow-hidden rounded-lg border border-border bg-card shadow-sm active:cursor-grabbing"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.caption || photo.originalName || "Foto del fotolibro"}
        className="h-full w-full object-cover"
        draggable={false}
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onSetCover(photo)}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70",
            isCover && "bg-accent text-accent-foreground hover:bg-accent"
          )}
          aria-label={isCover ? "Es la portada" : "Usar como portada"}
          title={isCover ? "Portada actual" : "Usar como portada"}
        >
          <Star className="h-4 w-4" fill={isCover ? "currentColor" : "none"} />
        </button>
        <div className="flex gap-1">
          {onRemoveFromPage ? (
            <button
              type="button"
              onClick={() => onRemoveFromPage(photo)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70"
              aria-label="Quitar de la página"
              title="Quitar de la página"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(photo)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-black/50 text-white hover:bg-destructive"
            aria-label="Eliminar foto"
            title="Eliminar foto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isCover ? (
        <span className="absolute bottom-2 left-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
          Portada
        </span>
      ) : null}

      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={() => caption !== (photo.caption ?? "") && onCaptionBlur(photo, caption)}
        onClick={(e) => e.stopPropagation()}
        placeholder="Descripción..."
        maxLength={500}
        className="absolute inset-x-0 bottom-0 border-none bg-black/50 px-2 py-1 text-xs text-white placeholder:text-white/70 opacity-0 transition-opacity focus-visible:outline-none group-hover:opacity-100 focus:opacity-100"
        aria-label="Descripción de la foto"
      />
    </motion.div>
  );
}
