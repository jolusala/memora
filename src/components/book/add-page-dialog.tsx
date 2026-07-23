"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LayoutPreview } from "@/components/book/layout-preview";
import { LAYOUT_ORDER, PAGE_LAYOUTS, type LayoutId } from "@/lib/layouts";

export function AddPageDialog({
  onAdd,
  suggestedLayouts,
}: {
  onAdd: (layout: LayoutId) => void;
  suggestedLayouts?: string[];
}) {
  const [open, setOpen] = useState(false);

  function handlePick(layout: LayoutId) {
    onAdd(layout);
    setOpen(false);
  }

  const ordered = [...LAYOUT_ORDER].sort((a, b) => {
    const aSuggested = suggestedLayouts?.includes(a) ? 0 : 1;
    const bSuggested = suggestedLayouts?.includes(b) ? 0 : 1;
    return aSuggested - bSuggested;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Agregar página
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elegí una composición</DialogTitle>
          <DialogDescription>
            Cada página puede tener una o varias fotos, en distintas distribuciones.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {ordered.map((layout) => (
            <motion.button
              key={layout}
              type="button"
              onClick={() => handlePick(layout)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="cursor-pointer space-y-2 rounded-lg border border-border p-2 text-left hover:border-accent hover:bg-muted"
            >
              <LayoutPreview layout={layout} />
              <p className="text-sm font-medium">{PAGE_LAYOUTS[layout].label}</p>
            </motion.button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
