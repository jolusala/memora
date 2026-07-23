import type { CSSProperties } from "react";
import {
  BookImage,
  Plane,
  Heart,
  Baby,
  PartyPopper,
  GraduationCap,
  CalendarHeart,
  TreePine,
  PawPrint,
  Users,
  Users2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type BookTemplateId =
  | "custom"
  | "travel"
  | "wedding"
  | "baby"
  | "birthday"
  | "graduation"
  | "anniversary"
  | "holiday"
  | "pet"
  | "family"
  | "friends"
  | "memories";

export interface BookTemplate {
  id: BookTemplateId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Hue (0-360) used to derive this template's catalog swatch colors. */
  hue: number;
  suggestedLayouts: string[];
}

export const BOOK_TEMPLATES: BookTemplate[] = [
  {
    id: "custom",
    label: "Personalizado",
    description: "Empieza en blanco y arma el fotolibro a tu manera.",
    icon: BookImage,
    hue: 30,
    suggestedLayouts: ["single", "duo"],
  },
  {
    id: "travel",
    label: "Viaje",
    description: "Ideal para itinerarios, paisajes y momentos de aventura.",
    icon: Plane,
    hue: 195,
    suggestedLayouts: ["feature", "grid4"],
  },
  {
    id: "wedding",
    label: "Boda",
    description: "Para el gran día: ceremonia, fiesta y los detalles.",
    icon: Heart,
    hue: 345,
    suggestedLayouts: ["single", "feature"],
  },
  {
    id: "baby",
    label: "Bebé",
    description: "Los primeros meses, mes a mes.",
    icon: Baby,
    hue: 205,
    suggestedLayouts: ["duo", "single"],
  },
  {
    id: "birthday",
    label: "Cumpleaños",
    description: "La torta, los invitados y todos los festejos.",
    icon: PartyPopper,
    hue: 32,
    suggestedLayouts: ["grid4", "duo"],
  },
  {
    id: "graduation",
    label: "Graduación",
    description: "El esfuerzo, el diploma y la celebración después.",
    icon: GraduationCap,
    hue: 225,
    suggestedLayouts: ["feature", "single"],
  },
  {
    id: "anniversary",
    label: "Aniversario",
    description: "Un repaso de los años juntos, edición tras edición.",
    icon: CalendarHeart,
    hue: 355,
    suggestedLayouts: ["single", "feature"],
  },
  {
    id: "holiday",
    label: "Navidad y fiestas",
    description: "Las reuniones y tradiciones de fin de año.",
    icon: TreePine,
    hue: 150,
    suggestedLayouts: ["grid4", "duo"],
  },
  {
    id: "pet",
    label: "Mascota",
    description: "Todas las travesuras y siestas de tu compañero.",
    icon: PawPrint,
    hue: 42,
    suggestedLayouts: ["grid4", "duo"],
  },
  {
    id: "family",
    label: "Familia",
    description: "Los momentos que unen a toda la familia.",
    icon: Users,
    hue: 18,
    suggestedLayouts: ["feature", "grid4"],
  },
  {
    id: "friends",
    label: "Amigos",
    description: "Las salidas y planes con tu grupo de siempre.",
    icon: Users2,
    hue: 48,
    suggestedLayouts: ["grid4", "duo"],
  },
  {
    id: "memories",
    label: "Recuerdos del año",
    description: "Un repaso de los mejores momentos de los últimos 12 meses.",
    icon: Sparkles,
    hue: 275,
    suggestedLayouts: ["grid4", "feature"],
  },
];

export function isBookTemplateId(value: string): value is BookTemplateId {
  return BOOK_TEMPLATES.some((t) => t.id === value);
}

export function getBookTemplate(id: string | null): BookTemplate {
  return BOOK_TEMPLATES.find((t) => t.id === id) ?? BOOK_TEMPLATES[0];
}

export function templateSwatchStyle(hue: number): CSSProperties {
  return {
    backgroundColor: `hsl(${hue} 55% 92%)`,
    color: `hsl(${hue} 45% 32%)`,
  };
}
