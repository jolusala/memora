"use client";

import { motion } from "motion/react";
import { BookImage } from "lucide-react";
import { PhotobookCard } from "@/components/dashboard/photobook-card";
import { CreateBookDialog } from "@/components/dashboard/create-book-dialog";
import type { Photobook } from "@/types";

export function PhotobookGrid({ books }: { books: Photobook[] }) {
  if (books.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center"
      >
        <BookImage className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-xl font-semibold">
          Todavía no tienes fotolibros
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Crea tu primer fotolibro para empezar a guardar y ordenar tus recuerdos.
        </p>
        <div className="mt-6">
          <CreateBookDialog />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <PhotobookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
