"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TemplateGrid } from "@/components/book/template-grid";
import type { BookTemplateId } from "@/lib/book-templates";

export function DesignPickerDialog({
  bookId,
  currentTemplate,
}: {
  bookId: string;
  currentTemplate: BookTemplateId;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<BookTemplateId>(currentTemplate);
  const [saving, setSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setTemplate(currentTemplate);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "No se pudo actualizar el diseño");
        return;
      }
      toast.success("Diseño actualizado");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error de red, intenta de nuevo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4" />
          Diseño
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Diseño del fotolibro</DialogTitle>
          <DialogDescription>
            Define el estilo, los colores y la portada que se usan al exportar el PDF impreso.
          </DialogDescription>
        </DialogHeader>

        <TemplateGrid value={template} onChange={setTemplate} layoutId="design-template-check" />

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="accent"
            onClick={handleSave}
            disabled={saving || template === currentTemplate}
          >
            {saving ? "Guardando..." : "Guardar diseño"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
