"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="container flex flex-col items-center gap-6 py-24 text-center sm:py-32">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground"
      >
        Tus recuerdos, ordenados y a salvo
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-3xl text-balance font-serif text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        Convierte tus fotos en fotolibros que perduran
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-xl text-balance text-lg text-muted-foreground"
      >
        Crea una cuenta, sube tus fotos y arma colecciones que puedes ver desde cualquier
        dispositivo. Cada quien ve solo sus propios recuerdos.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Button asChild variant="accent" size="lg">
          <Link href={isAuthenticated ? "/dashboard" : "/register"}>
            {isAuthenticated ? "Ir a mi panel" : "Empezar gratis"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        {!isAuthenticated ? (
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        ) : null}
      </motion.div>
    </section>
  );
}
