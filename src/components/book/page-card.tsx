"use client";

import { motion } from "motion/react";
import { ChevronUp, ChevronDown, Trash2, LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PhotoSlot } from "@/components/book/photo-slot";
import { PAGE_LAYOUTS, LAYOUT_ORDER, type LayoutId } from "@/lib/layouts";
import type { Page, Photo } from "@/types";

export function PageCard({
  page,
  index,
  isFirst,
  isLast,
  photosBySlot,
  coverPhotoId,
  draggingPhotoId,
  onMove,
  onDeletePage,
  onLayoutChange,
  onDropPhoto,
  onSetCover,
  onDeletePhoto,
  onCaptionBlur,
  onRemoveFromPage,
  onDragStart,
  onDragEnd,
}: {
  page: Page;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  photosBySlot: (Photo | undefined)[];
  coverPhotoId: string | null;
  draggingPhotoId: string | null;
  onMove: (pageId: string, direction: "up" | "down") => void;
  onDeletePage: (pageId: string) => void;
  onLayoutChange: (pageId: string, layout: LayoutId) => void;
  onDropPhoto: (pageId: string, slot: number, photoId: string) => void;
  onSetCover: (photo: Photo) => void;
  onDeletePhoto: (photo: Photo) => void;
  onCaptionBlur: (photo: Photo, caption: string) => void;
  onRemoveFromPage: (photo: Photo) => void;
  onDragStart: (photo: Photo) => void;
  onDragEnd: () => void;
}) {
  const layout = PAGE_LAYOUTS[page.layout];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Página {index + 1} · {layout.label}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isFirst}
            onClick={() => onMove(page.id, "up")}
            aria-label="Mover página arriba"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isLast}
            onClick={() => onMove(page.id, "down")}
            aria-label="Mover página abajo"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Cambiar composición"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LAYOUT_ORDER.map((id) => (
                <DropdownMenuItem key={id} onClick={() => onLayoutChange(page.id, id)}>
                  {PAGE_LAYOUTS[id].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDeletePage(page.id)}
            aria-label="Eliminar página"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={`grid gap-2 ${layout.gridClassName}`}>
        {layout.slotSpecs.map((spec, slot) => (
          <PhotoSlot
            key={slot}
            className={spec.className}
            photo={photosBySlot[slot]}
            coverPhotoId={coverPhotoId}
            draggingPhotoId={draggingPhotoId}
            onDropPhoto={(photoId) => onDropPhoto(page.id, slot, photoId)}
            onSetCover={onSetCover}
            onDelete={onDeletePhoto}
            onCaptionBlur={onCaptionBlur}
            onRemoveFromPage={onRemoveFromPage}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </motion.div>
  );
}
