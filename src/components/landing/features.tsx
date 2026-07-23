"use client";

import { motion } from "motion/react";
import { FolderHeart, UploadCloud, Smartphone } from "lucide-react";

const FEATURES = [
  {
    icon: FolderHeart,
    title: "Organizá por momentos",
    description:
      "Creá un fotolibro por viaje, evento o etapa de tu vida y mantené todo ordenado.",
  },
  {
    icon: UploadCloud,
    title: "Subí y reordená fácil",
    description:
      "Arrastrá tus fotos, elegí la portada y ordenalas como quieras con un solo gesto.",
  },
  {
    icon: Smartphone,
    title: "Accedé desde cualquier lado",
    description:
      "Tus fotolibros viven en la nube: entrá desde el celular, la tablet o la compu.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border bg-muted/40 py-20">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <feature.icon className="h-8 w-8 text-accent" aria-hidden="true" />
              <h3 className="mt-4 font-serif text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
