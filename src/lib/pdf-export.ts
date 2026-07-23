import path from "path";
import fs from "fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import { getUploadDir } from "@/lib/uploads";
import type { LayoutId } from "@/lib/layouts";
import type { Page, Photo, Photobook } from "@/types";

const PAGE_SIZE = 576; // 8x8in square at 72pt/in
const MARGIN = 28;
const GAP = 10;
const SLOT_BG = rgb(0.95, 0.94, 0.9);

interface SlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Fractional rects (0..1) within the content area, in PDF coordinates
// (origin bottom-left, y increases upward). Mirrors the CSS grid auto-
// placement used by the equivalent Tailwind layouts in src/lib/layouts.ts.
const SLOT_RECTS: Record<LayoutId, SlotRect[]> = {
  single: [{ x: 0, y: 0, w: 1, h: 1 }],
  duo: [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 1 },
  ],
  feature: [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
  ],
  grid4: [
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
  ],
};

function insetRect(rect: SlotRect, contentSize: number, gap: number): SlotRect {
  const half = gap / 2;
  return {
    x: rect.x * contentSize + (rect.x > 0 ? half : 0),
    y: rect.y * contentSize + (rect.y > 0 ? half : 0),
    w: rect.w * contentSize - (rect.x > 0 && rect.x + rect.w < 1 ? gap : half),
    h: rect.h * contentSize - (rect.y > 0 && rect.y + rect.h < 1 ? gap : half),
  };
}

async function loadEmbeddableJpeg(filename: string): Promise<Buffer> {
  const filePath = path.join(getUploadDir(), filename);
  const raw = await fs.readFile(filePath);
  return sharp(raw)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 87 })
    .toBuffer();
}

export async function generateBookPdf(
  book: Photobook,
  pages: Page[],
  photos: Photo[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(book.title);
  doc.setProducer("Memora");

  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);

  const cover = doc.addPage([PAGE_SIZE, PAGE_SIZE]);
  const titleSize = 32;
  const titleWidth = serif.widthOfTextAtSize(book.title, titleSize);
  cover.drawText(book.title, {
    x: (PAGE_SIZE - Math.min(titleWidth, PAGE_SIZE - MARGIN * 2)) / 2,
    y: PAGE_SIZE / 2 + 10,
    size: titleSize,
    font: serif,
    color: rgb(0.09, 0.09, 0.1),
    maxWidth: PAGE_SIZE - MARGIN * 2,
  });
  if (book.description) {
    const descSize = 13;
    const descWidth = sans.widthOfTextAtSize(book.description, descSize);
    cover.drawText(book.description, {
      x: (PAGE_SIZE - Math.min(descWidth, PAGE_SIZE - MARGIN * 2)) / 2,
      y: PAGE_SIZE / 2 - 20,
      size: descSize,
      font: sans,
      color: rgb(0.4, 0.38, 0.35),
      maxWidth: PAGE_SIZE - MARGIN * 2,
    });
  }

  const sortedPages = [...pages].sort((a, b) => a.position - b.position);
  const contentSize = PAGE_SIZE - MARGIN * 2;

  for (const page of sortedPages) {
    const pdfPage = doc.addPage([PAGE_SIZE, PAGE_SIZE]);
    const rects = SLOT_RECTS[page.layout] ?? SLOT_RECTS.single;
    const slotPhotos = photos.filter((p) => p.pageId === page.id);

    for (const photo of slotPhotos) {
      if (photo.slot === null || photo.slot >= rects.length) continue;
      const rect = insetRect(rects[photo.slot], contentSize, GAP);
      const x = MARGIN + rect.x;
      const y = MARGIN + rect.y;

      pdfPage.drawRectangle({ x, y, width: rect.w, height: rect.h, color: SLOT_BG });

      try {
        const jpeg = await loadEmbeddableJpeg(photo.filename);
        const img = await doc.embedJpg(jpeg);
        const scale = Math.min(rect.w / img.width, rect.h / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        pdfPage.drawImage(img, {
          x: x + (rect.w - drawW) / 2,
          y: y + (rect.h - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      } catch {
        // Skip photos that fail to load/decode rather than aborting the export.
      }

      if (photo.caption) {
        const captionSize = 8;
        pdfPage.drawRectangle({
          x,
          y,
          width: rect.w,
          height: captionSize + 8,
          color: rgb(0, 0, 0),
          opacity: 0.45,
        });
        pdfPage.drawText(photo.caption.slice(0, 80), {
          x: x + 4,
          y: y + 4,
          size: captionSize,
          font: sans,
          color: rgb(1, 1, 1),
        });
      }
    }
  }

  return doc.save();
}
