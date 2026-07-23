"use client";

import { motion } from "motion/react";
import { UserPlus, Upload, LayoutGrid, Download } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Creá tu cuenta",
    description: "Registrate gratis con tu email o con Google en unos segundos.",
  },
  {
    icon: Upload,
    title: "Subí tus fotos",
    description: "Arrastrá las fotos que quieras guardar, cuantas quieras.",
  },
  {
    icon: LayoutGrid,
    title: "Armá tus páginas",
    description: "Elegí una plantilla y las composiciones que más te gusten.",
  },
  {
    icon: Download,
    title: "Exportá cuando quieras",
    description: "Descargá tu fotolibro en PDF, listo para guardar o compartir.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-muted/40 py-16">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Hecho en minutos, para guardar toda la vida
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="relative text-center"
            >
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border">
                <step.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
