"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function CreateBookDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<BookTemplateId>("custom");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          template,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo crear el fotolibro");
        return;
      }
      toast.success("Fotolibro creado");
      setOpen(false);
      setTitle("");
      setDescription("");
      setTemplate("custom");
      router.push(`/books/${data.book.id}`);
    } catch {
      toast.error("Error de red, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          Nuevo fotolibro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear fotolibro</DialogTitle>
            <DialogDescription>
              Elige una plantilla y dale un nombre a tu nueva colección de recuerdos.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Plantilla</Label>
              <TemplateGrid value={template} onChange={setTemplate} layoutId="create-template-check" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vacaciones de verano 2026"
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Un breve resumen de este fotolibro"
                maxLength={2000}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" variant="accent" disabled={loading || !title.trim()}>
              {loading ? "Creando..." : "Crear fotolibro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
