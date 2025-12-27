export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function getUploadDir(category: string) {
  return path.join(process.cwd(), "uploads", "media", category);
}

async function registerMedia(filepath: string, format: string) {
  const res = await fetch(`${BACKEND}/api/media/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filepath, format }),
  });
  return res.json();
}

/* Resize methods identical to before */
async function createSquare(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(600, 600, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

async function createRectangle(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(1200, 900, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

async function optimizeOriginal(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/* ---------------------------------------------------------
   MAIN ROUTE
--------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const category = (form.get("category") as string) || "articles";

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const baseName = file.name.replace(/\s+/g, "-");
    const now = Date.now();

    const dir = getUploadDir(category);
    await mkdir(dir, { recursive: true });

    /* 1) ORIGINAL */
    const originalBuf = await optimizeOriginal(buffer);
    const originalName = `${now}_${baseName}`;
    const originalPath = path.join(dir, originalName);
    await writeFile(originalPath, originalBuf);
    const originalPublic = `/uploads/media/${category}/${originalName}`;

    /* 2) RECTANGLE */
    const rectBuf = await createRectangle(buffer);
    const rectName = `${now}_${baseName.replace(".", "_rect.")}`;
    const rectPath = path.join(dir, rectName);
    await writeFile(rectPath, rectBuf);
    const rectPublic = `/uploads/media/${category}/${rectName}`;

    /* 3) SQUARE */
    const squareBuf = await createSquare(buffer);
    const squareName = `${now}_${baseName.replace(".", "_square.")}`;
    const squarePath = path.join(dir, squareName);
    await writeFile(squarePath, squareBuf);
    const squarePublic = `/uploads/media/${category}/${squareName}`;

    /* REGISTER IN BACKEND */
    const regOriginal = await registerMedia(originalPublic, "original");
    const regRect = await registerMedia(rectPublic, "rectangle");
    const regSquare = await registerMedia(squarePublic, "square");

    return NextResponse.json({
      status: "ok",
      items: {
        original: {
          media_id: regOriginal.media_id,
          url: `/media/${category}/${originalName}`,
        },
        rectangle: {
          media_id: regRect.media_id,
          url: `/media/${category}/${rectName}`,
        },
        square: {
          media_id: regSquare.media_id,
          url: `/media/${category}/${squareName}`,
        },
      },
    });

  } catch (err: any) {
    console.error("❌ Upload error :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
