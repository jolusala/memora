"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import type { Photo } from "@/types";

export function UploadDropzone({
  bookId,
  onUploaded,
}: {
  bookId: string;
  onUploaded: (photos: Photo[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;

      setUploading(true);
      const formData = new FormData();
      list.forEach((file) => formData.append("files", file));

      try {
        const res = await fetch(`/api/books/${bookId}/photos`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "No se pudieron subir las fotos");
          return;
        }
        onUploaded(data.photos as Photo[]);
        toast.success(
          list.length === 1 ? "Foto subida" : `${list.length} fotos subidas`
        );
      } catch {
        toast.error("Error de red, intenta de nuevo");
      } finally {
        setUploading(false);
      }
    },
    [bookId, onUploaded]
  );

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label="Subir fotos"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
      }}
      animate={{
        borderColor: isDragging ? "hsl(var(--accent))" : "hsl(var(--border))",
        backgroundColor: isDragging ? "hsl(var(--muted))" : "transparent",
      }}
      transition={{ duration: 0.15 }}
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">
        {uploading ? "Subiendo..." : "Arrastrá tus fotos aquí o hacé clic para elegirlas"}
      </p>
      <p className="text-sm text-muted-foreground">JPG, PNG, WEBP o GIF · hasta 15MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </motion.div>
  );
}
