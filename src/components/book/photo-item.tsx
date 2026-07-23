"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { GripVertical, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types";

export function PhotoItem({
  photo,
  isCover,
  onDelete,
  onSetCover,
  onCaptionBlur,
}: {
  photo: Photo;
  isCover: boolean;
  onDelete: (photo: Photo) => void;
  onSetCover: (photo: Photo) => void;
  onCaptionBlur: (photo: Photo, caption: string) => void;
}) {
  const controls = useDragControls();
  const [caption, setCaption] = useState(photo.caption ?? "");

  return (
    <Reorder.Item
      value={photo}
      id={photo.id}
      dragListener={false}
      dragControls={controls}
      className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || photo.originalName || "Foto del fotolibro"}
          className="h-full w-full object-cover"
          draggable={false}
        />

        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          className="absolute left-2 top-2 flex h-8 w-8 cursor-grab items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
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

        {isCover ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            Portada
          </span>
        ) : null}
      </div>

      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={() => caption !== (photo.caption ?? "") && onCaptionBlur(photo, caption)}
        placeholder="Agregar descripción..."
        maxLength={500}
        className="w-full border-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Descripción de la foto"
      />
    </Reorder.Item>
  );
}
