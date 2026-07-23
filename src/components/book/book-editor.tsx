"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/book/upload-dropzone";
import { PhotoPool } from "@/components/book/photo-pool";
import { PageCard } from "@/components/book/page-card";
import { AddPageDialog } from "@/components/book/add-page-dialog";
import { getBookTemplate } from "@/lib/book-templates";
import { PAGE_LAYOUTS, type LayoutId } from "@/lib/layouts";
import type { Page, Photo, Photobook } from "@/types";

export function BookEditor({
  book,
  initialPhotos,
  initialPages,
}: {
  book: Photobook;
  initialPhotos: Photo[];
  initialPages: Page[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [pages, setPages] = useState(initialPages);
  const [coverPhotoId, setCoverPhotoId] = useState(book.coverPhotoId);
  const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null);

  const unassigned = photos.filter((p) => !p.pageId);

  function photosBySlotFor(pageId: string, slots: number): (Photo | undefined)[] {
    const bySlot: (Photo | undefined)[] = new Array(slots).fill(undefined);
    for (const photo of photos) {
      if (photo.pageId === pageId && photo.slot !== null && photo.slot < slots) {
        bySlot[photo.slot] = photo;
      }
    }
    return bySlot;
  }

  function handleUploaded(newPhotos: Photo[]) {
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (!coverPhotoId && newPhotos[0]) {
      setCoverPhotoId(newPhotos[0].id);
    }
    router.refresh();
  }

  async function handleDeletePhoto(photo: Photo) {
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
    router.refresh();
  }

  async function handleCaptionBlur(photo: Photo, caption: string) {
    await fetch(`/api/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: caption || null }),
    }).catch(() => undefined);
  }

  async function assignPhoto(photoId: string, pageId: string | null, slot: number | null) {
    const previous = photos;
    const dragged = photos.find((p) => p.id === photoId);
    if (!dragged) return;

    setPhotos((prev) => {
      let next = prev;
      if (pageId !== null && slot !== null) {
        const occupant = prev.find(
          (p) => p.pageId === pageId && p.slot === slot && p.id !== photoId
        );
        next = prev.map((p) => {
          if (p.id === photoId) return { ...p, pageId, slot };
          if (occupant && p.id === occupant.id) {
            return { ...p, pageId: dragged.pageId, slot: dragged.slot };
          }
          return p;
        });
      } else {
        next = prev.map((p) => (p.id === photoId ? { ...p, pageId: null, slot: null } : p));
      }
      return next;
    });

    const res = await fetch(`/api/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, slot }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setPhotos(previous);
      const data = await res?.json().catch(() => null);
      toast.error(data?.error ?? "No se pudo mover la foto");
    }
  }

  function handleDragStart(photo: Photo) {
    setDraggingPhotoId(photo.id);
  }
  function handleDragEnd() {
    setDraggingPhotoId(null);
  }

  async function handleAddPage(layout: LayoutId) {
    const res = await fetch(`/api/books/${book.id}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res || !res.ok) {
      toast.error(data?.error ?? "No se pudo agregar la página");
      return;
    }
    setPages((prev) => [...prev, data.page as Page]);
  }

  async function handleDeletePage(pageId: string) {
    const previousPages = pages;
    const previousPhotos = photos;
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    setPhotos((prev) =>
      prev.map((p) => (p.pageId === pageId ? { ...p, pageId: null, slot: null } : p))
    );
    const res = await fetch(`/api/books/${book.id}/pages/${pageId}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!res || !res.ok) {
      setPages(previousPages);
      setPhotos(previousPhotos);
      toast.error("No se pudo eliminar la página");
    }
  }

  async function handleMovePage(pageId: string, direction: "up" | "down") {
    const sorted = [...pages].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((p) => p.id === pageId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= sorted.length) return;

    const previous = pages;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === a.id) return { ...p, position: b.position };
        if (p.id === b.id) return { ...p, position: a.position };
        return p;
      })
    );

    const res = await fetch(`/api/books/${book.id}/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    }).catch(() => null);
    if (!res || !res.ok) {
      setPages(previous);
      toast.error("No se pudo mover la página");
    }
  }

  async function handleLayoutChange(pageId: string, layout: LayoutId) {
    const previousPages = pages;
    const previousPhotos = photos;
    const newSlots = PAGE_LAYOUTS[layout].slots;

    setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, layout } : p)));
    setPhotos((prev) =>
      prev.map((p) =>
        p.pageId === pageId && p.slot !== null && p.slot >= newSlots
          ? { ...p, pageId: null, slot: null }
          : p
      )
    );

    const res = await fetch(`/api/books/${book.id}/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout }),
    }).catch(() => null);
    if (!res || !res.ok) {
      setPages(previousPages);
      setPhotos(previousPhotos);
      toast.error("No se pudo cambiar la composición");
    }
  }

  const sortedPages = [...pages].sort((a, b) => a.position - b.position);
  const template = getBookTemplate(book.template);

  return (
    <div className="space-y-8">
      <UploadDropzone bookId={book.id} onUploaded={handleUploaded} />

      <div>
        <h2 className="mb-3 font-serif text-lg font-semibold">Fotos sin usar</h2>
        <PhotoPool
          photos={unassigned}
          coverPhotoId={coverPhotoId}
          draggingPhotoId={draggingPhotoId}
          onDropUnassigned={(photoId) => assignPhoto(photoId, null, null)}
          onSetCover={handleSetCover}
          onDelete={handleDeletePhoto}
          onCaptionBlur={handleCaptionBlur}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold">Páginas del fotolibro</h2>
          <AddPageDialog onAdd={handleAddPage} suggestedLayouts={template.suggestedLayouts} />
        </div>

        {sortedPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
            <p className="text-sm">
              Todavía no armaste ninguna página. Agrega una y arrastra fotos desde arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedPages.map((page, index) => (
                <PageCard
                  key={page.id}
                  page={page}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === sortedPages.length - 1}
                  photosBySlot={photosBySlotFor(page.id, PAGE_LAYOUTS[page.layout].slots)}
                  coverPhotoId={coverPhotoId}
                  draggingPhotoId={draggingPhotoId}
                  onMove={handleMovePage}
                  onDeletePage={handleDeletePage}
                  onLayoutChange={handleLayoutChange}
                  onDropPhoto={(pageId, slot, photoId) => assignPhoto(photoId, pageId, slot)}
                  onSetCover={handleSetCover}
                  onDeletePhoto={handleDeletePhoto}
                  onCaptionBlur={handleCaptionBlur}
                  onRemoveFromPage={(photo) => assignPhoto(photo.id, null, null)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
