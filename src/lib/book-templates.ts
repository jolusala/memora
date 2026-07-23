import { BookImage, Plane, Heart, Baby, PartyPopper, type LucideIcon } from "lucide-react";

export type BookTemplateId = "custom" | "travel" | "wedding" | "baby" | "birthday";

export interface BookTemplate {
  id: BookTemplateId;
  label: string;
  description: string;
  icon: LucideIcon;
  suggestedLayouts: string[];
}

export const BOOK_TEMPLATES: BookTemplate[] = [
  {
    id: "custom",
    label: "Personalizado",
    description: "Empezá en blanco y armá el fotolibro a tu manera.",
    icon: BookImage,
    suggestedLayouts: ["single", "duo"],
  },
  {
    id: "travel",
    label: "Viaje",
    description: "Ideal para itinerarios, paisajes y momentos de aventura.",
    icon: Plane,
    suggestedLayouts: ["feature", "grid4"],
  },
  {
    id: "wedding",
    label: "Boda",
    description: "Para el gran día: ceremonia, fiesta y los detalles.",
    icon: Heart,
    suggestedLayouts: ["single", "feature"],
  },
  {
    id: "baby",
    label: "Bebé",
    description: "Los primeros meses, mes a mes.",
    icon: Baby,
    suggestedLayouts: ["duo", "single"],
  },
  {
    id: "birthday",
    label: "Cumpleaños",
    description: "La torta, los invitados y todos los festejos.",
    icon: PartyPopper,
    suggestedLayouts: ["grid4", "duo"],
  },
];

export function isBookTemplateId(value: string): value is BookTemplateId {
  return BOOK_TEMPLATES.some((t) => t.id === value);
}

export function getBookTemplate(id: string | null): BookTemplate {
  return BOOK_TEMPLATES.find((t) => t.id === id) ?? BOOK_TEMPLATES[0];
}
