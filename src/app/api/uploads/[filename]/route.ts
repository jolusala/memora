import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getUploadDir, contentTypeForFilename } from "@/lib/uploads";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: rawFilename } = await params;
  const filename = path.basename(rawFilename);

  const filePath = path.join(getUploadDir(), filename);

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypeForFilename(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }
}
