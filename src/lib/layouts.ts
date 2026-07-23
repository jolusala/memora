export type LayoutId = "single" | "duo" | "feature" | "grid4";

export interface SlotSpec {
  className: string;
}

export interface PageLayout {
  id: LayoutId;
  label: string;
  slots: number;
  gridClassName: string;
  slotSpecs: SlotSpec[];
}

export const PAGE_LAYOUTS: Record<LayoutId, PageLayout> = {
  single: {
    id: "single",
    label: "1 foto",
    slots: 1,
    gridClassName: "grid-cols-1 grid-rows-1",
    slotSpecs: [{ className: "col-span-1 row-span-1" }],
  },
  duo: {
    id: "duo",
    label: "2 fotos, lado a lado",
    slots: 2,
    gridClassName: "grid-cols-2 grid-rows-1",
    slotSpecs: [
      { className: "col-span-1 row-span-1" },
      { className: "col-span-1 row-span-1" },
    ],
  },
  feature: {
    id: "feature",
    label: "1 grande + 2 chicas",
    slots: 3,
    gridClassName: "grid-cols-2 grid-rows-2",
    slotSpecs: [
      { className: "col-span-1 row-span-2" },
      { className: "col-span-1 row-span-1" },
      { className: "col-span-1 row-span-1" },
    ],
  },
  grid4: {
    id: "grid4",
    label: "4 en grilla",
    slots: 4,
    gridClassName: "grid-cols-2 grid-rows-2",
    slotSpecs: [
      { className: "col-span-1 row-span-1" },
      { className: "col-span-1 row-span-1" },
      { className: "col-span-1 row-span-1" },
      { className: "col-span-1 row-span-1" },
    ],
  },
};

export const LAYOUT_ORDER: LayoutId[] = ["single", "duo", "feature", "grid4"];

export function isLayoutId(value: string): value is LayoutId {
  return value in PAGE_LAYOUTS;
}
