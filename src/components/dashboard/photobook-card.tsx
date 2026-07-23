"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ImageOff } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Photobook } from "@/types";

export function PhotobookCard({ book }: { book: Photobook }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link href={`/books/${book.id}`} className="block">
        <Card className="overflow-hidden py-0">
          <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.coverUrl}
                alt={book.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="h-8 w-8" aria-hidden="true" />
              </div>
            )}
          </div>
          <CardContent className="pt-4">
            <h3 className="truncate font-serif text-lg font-semibold">{book.title}</h3>
            {book.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {book.description}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="pb-4 pt-0 text-xs text-muted-foreground">
            {book.photoCount} {book.photoCount === 1 ? "foto" : "fotos"}
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
