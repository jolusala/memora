"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BOOK_TEMPLATES, templateSwatchStyle } from "@/lib/book-templates";

export function OccasionShowcase({ isAuthenticated }: { isAuthenticated: boolean }) {
  const href = isAuthenticated ? "/dashboard" : "/register";
  const occasions = BOOK_TEMPLATES.filter((t) => t.id !== "custom");

  return (
    <section className="border-t border-border py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Un fotolibro para cada ocasión
          </h2>
          <p className="mt-2 text-muted-foreground">
            Elige el punto de partida y personalizalo como quieras.
          </p>
        </div>

        <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-6 lg:grid-cols-11">
          {occasions.map((occasion, i) => (
            <motion.div
              key={occasion.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: (i % 6) * 0.05 }}
              className="w-20 shrink-0 snap-start sm:w-auto"
            >
              <Link
                href={href}
                className="group flex flex-col items-center gap-2 rounded-lg p-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <motion.span
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-shadow group-hover:shadow-md"
                  style={templateSwatchStyle(occasion.hue)}
                >
                  <occasion.icon className="h-6 w-6" aria-hidden="true" />
                </motion.span>
                <span className="text-xs font-medium leading-tight text-foreground">
                  {occasion.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
