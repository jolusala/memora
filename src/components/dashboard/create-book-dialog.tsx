"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { BOOK_TEMPLATES, type BookTemplateId } from "@/lib/book-templates";

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
      <DialogContent className="max-w-lg">
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
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {BOOK_TEMPLATES.map((option) => {
                  const isSelected = template === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => setTemplate(option.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={cn(
                        "relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors",
                        isSelected
                          ? "border-accent bg-accent/10"
                          : "border-border hover:bg-muted"
                      )}
                      aria-pressed={isSelected}
                      title={option.description}
                    >
                      {isSelected ? (
                        <motion.span
                          layoutId="template-check"
                          className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground"
                        >
                          <Check className="h-3 w-3" />
                        </motion.span>
                      ) : null}
                      <option.icon
                        className={cn(
                          "h-5 w-5",
                          isSelected ? "text-accent" : "text-muted-foreground"
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium leading-tight">
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
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
