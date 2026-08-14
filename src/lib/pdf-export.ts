import path from "path";
import fs from "fs/promises";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type RGB } from "pdf-lib";
import sharp from "sharp";
import { getUploadDir } from "@/lib/uploads";
import type { LayoutId } from "@/lib/layouts";
import type { Page, Photo, Photobook } from "@/types";
import { getBookTemplate } from "@/lib/book-templates";

const PAGE_SIZE = 576; // 8x8in square at 72pt/in
const MARGIN = 28;
const GAP = 10;
const SLOT_BG = rgb(0.95, 0.94, 0.9);
const PAGE_BG = rgb(0.992, 0.988, 0.965);

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

/** Converts an hsl() triple (h in degrees, s/l in percent) to a pdf-lib RGB color. */
function hslToRgb(h: number, s: number, l: number): RGB {
  const sf = s / 100;
  const lf = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sf * Math.min(lf, 1 - lf);
  const f = (n: number) => lf - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgb(f(0), f(8), f(4));
}

/** Shrinks a font size until the given text fits within maxWidth on one line. */
function fitFontSize(
  font: PDFFont,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize = 16
): number {
  let size = startSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1;
  }
  return size;
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

async function drawCoverPage(
  doc: PDFDocument,
  book: Photobook,
  coverPhoto: Photo | undefined,
  serif: PDFFont,
  sans: PDFFont
) {
  const template = getBookTemplate(book.template);
  const accent = hslToRgb(template.hue, 68, 42);
  const tint = hslToRgb(template.hue, 55, 92);
  const tintText = hslToRgb(template.hue, 45, 30);

  const cover = doc.addPage([PAGE_SIZE, PAGE_SIZE]);
  const contentWidth = PAGE_SIZE - MARGIN * 2;

  let hasPhoto = false;
  if (coverPhoto) {
    try {
      const jpeg = await loadEmbeddableJpeg(coverPhoto.filename);
      const img = await doc.embedJpg(jpeg);
      const scale = Math.max(PAGE_SIZE / img.width, PAGE_SIZE / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      cover.drawImage(img, {
        x: (PAGE_SIZE - drawW) / 2,
        y: (PAGE_SIZE - drawH) / 2,
        width: drawW,
        height: drawH,
      });
      hasPhoto = true;
    } catch {
      hasPhoto = false;
    }
  }

  if (!hasPhoto) {
    cover.drawRectangle({ x: 0, y: 0, width: PAGE_SIZE, height: PAGE_SIZE, color: tint });
    const cx = PAGE_SIZE / 2;
    const cy = PAGE_SIZE / 2 + 46;
    cover.drawEllipse({
      x: cx,
      y: cy,
      xScale: 150,
      yScale: 150,
      borderColor: accent,
      borderOpacity: 0.45,
      borderWidth: 2,
    });
    cover.drawEllipse({
      x: cx,
      y: cy,
      xScale: 112,
      yScale: 112,
      borderColor: accent,
      borderOpacity: 0.3,
      borderWidth: 1,
    });
  }

  const panelHeight = hasPhoto ? PAGE_SIZE * 0.36 : PAGE_SIZE * 0.3;
  if (hasPhoto) {
    cover.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_SIZE,
      height: panelHeight,
      color: rgb(0.04, 0.04, 0.05),
      opacity: 0.55,
    });
  }

  const ruleY = hasPhoto ? panelHeight - 24 : panelHeight + 36;
  cover.drawLine({
    start: { x: PAGE_SIZE / 2 - 22, y: ruleY },
    end: { x: PAGE_SIZE / 2 + 22, y: ruleY },
    thickness: 2,
    color: hasPhoto ? rgb(1, 1, 1) : accent,
    opacity: hasPhoto ? 0.85 : 1,
  });

  const titleColor = hasPhoto ? rgb(1, 1, 1) : tintText;
  const descColor = hasPhoto ? rgb(0.93, 0.93, 0.91) : hslToRgb(template.hue, 30, 45);

  const titleSize = fitFontSize(serif, book.title, contentWidth, 32);
  const titleWidth = serif.widthOfTextAtSize(book.title, titleSize);
  const titleY = hasPhoto ? panelHeight - 54 : panelHeight;
  cover.drawText(book.title, {
    x: (PAGE_SIZE - Math.min(titleWidth, contentWidth)) / 2,
    y: titleY,
    size: titleSize,
    font: serif,
    color: titleColor,
    maxWidth: contentWidth,
  });

  if (book.description) {
    const descSize = 12;
    const descWidth = sans.widthOfTextAtSize(book.description, descSize);
    cover.drawText(book.description, {
      x: (PAGE_SIZE - Math.min(descWidth, contentWidth)) / 2,
      y: titleY - 22,
      size: descSize,
      font: sans,
      color: descColor,
      maxWidth: contentWidth,
    });
  }

  // Hardcover-style border frame, tinted with the book's template color.
  cover.drawRectangle({
    x: 7,
    y: 7,
    width: PAGE_SIZE - 14,
    height: PAGE_SIZE - 14,
    borderColor: hasPhoto ? rgb(1, 1, 1) : accent,
    borderOpacity: hasPhoto ? 0.7 : 1,
    borderWidth: 2.5,
  });

  const footer = `PICBOOK   ·   ${template.label.toUpperCase()}`;
  const footerSize = 8;
  const footerWidth = sans.widthOfTextAtSize(footer, footerSize);
  cover.drawText(footer, {
    x: (PAGE_SIZE - footerWidth) / 2,
    y: 20,
    size: footerSize,
    font: sans,
    color: hasPhoto ? rgb(1, 1, 1) : accent,
    opacity: 0.85,
  });
}

export async function generateBookPdf(
  book: Photobook,
  pages: Page[],
  photos: Photo[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(book.title);
  doc.setProducer("Picbook");

  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);

  const coverPhoto = photos.find((p) => p.id === book.coverPhotoId);
  await drawCoverPage(doc, book, coverPhoto, serif, sans);

  const template = getBookTemplate(book.template);
  const frameColor = hslToRgb(template.hue, 55, 65);

  const sortedPages = [...pages].sort((a, b) => a.position - b.position);
  const contentSize = PAGE_SIZE - MARGIN * 2;

  for (const [index, page] of sortedPages.entries()) {
    const pdfPage = doc.addPage([PAGE_SIZE, PAGE_SIZE]);
    pdfPage.drawRectangle({ x: 0, y: 0, width: PAGE_SIZE, height: PAGE_SIZE, color: PAGE_BG });
    pdfPage.drawRectangle({
      x: 9,
      y: 9,
      width: PAGE_SIZE - 18,
      height: PAGE_SIZE - 18,
      borderColor: frameColor,
      borderOpacity: 0.6,
      borderWidth: 1,
    });

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

    const pageLabel = String(index + 1);
    const pageLabelSize = 8;
    const pageLabelWidth = sans.widthOfTextAtSize(pageLabel, pageLabelSize);
    pdfPage.drawText(pageLabel, {
      x: (PAGE_SIZE - pageLabelWidth) / 2,
      y: 14,
      size: pageLabelSize,
      font: sans,
      color: rgb(0.55, 0.53, 0.5),
    });
  }

  return doc.save();
}
