"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOOK_TEMPLATES, templateSwatchStyle, type BookTemplateId } from "@/lib/book-templates";

export function TemplateGrid({
  value,
  onChange,
  layoutId = "template-check",
}: {
  value: BookTemplateId;
  onChange: (id: BookTemplateId) => void;
  layoutId?: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {BOOK_TEMPLATES.map((option) => {
        const isSelected = value === option.id;
        return (
          <motion.button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors",
              isSelected ? "border-accent bg-accent/10" : "border-border hover:bg-muted"
            )}
            aria-pressed={isSelected}
            title={option.description}
          >
            {isSelected ? (
              <motion.span
                layoutId={layoutId}
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground"
              >
                <Check className="h-3 w-3" />
              </motion.span>
            ) : null}
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={templateSwatchStyle(option.hue)}
            >
              <option.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium leading-tight">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
