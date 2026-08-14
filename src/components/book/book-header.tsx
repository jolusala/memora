"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PrintCheckoutDialog } from "@/components/book/print-checkout-dialog";
import type { Photobook } from "@/types";

export function BookHeader({ book }: { book: Photobook }) {
  const router = useRouter();
  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description ?? "");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function save(field: "title" | "description", value: string) {
    await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    }).catch(() => undefined);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("No se pudo eliminar el fotolibro");
        return;
      }
      toast.success("Fotolibro eliminado");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/books/${book.id}/export`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "No se pudo exportar el PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${book.title || "fotolibro"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Error de red, intenta de nuevo");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a mis fotolibros
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() =>
              title.trim() && title !== book.title && save("title", title.trim())
            }
            className="h-auto border-none bg-transparent px-0 font-serif text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0 sm:text-3xl"
            aria-label="Título del fotolibro"
            maxLength={200}
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() =>
              description !== (book.description ?? "") && save("description", description)
            }
            placeholder="Agrega una descripción para este fotolibro..."
            className="min-h-0 resize-none border-none bg-transparent px-0 text-muted-foreground shadow-none focus-visible:ring-0"
            rows={2}
            maxLength={2000}
          />
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <PrintCheckoutDialog bookTitle={book.title} />

          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4" />
            {exporting ? "Generando..." : "Exportar a PDF"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar este fotolibro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se borrarán permanentemente el fotolibro y todas sus fotos. Esta acción no
                  se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
