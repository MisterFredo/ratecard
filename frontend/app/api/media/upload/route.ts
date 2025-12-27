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

async function registerMedia(filepath: string, format: string, title: string) {
  const res = await fetch(`${BACKEND}/api/media/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filepath, format, title }), // 🆕 title envoyé au backend
  });
  return res.json();
}

async function createSquare(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(600, 600, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

async function createRectangle(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(1200, 900, { fit: "cover" })
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
    const category = (form.get("category") as string) || "logos";
    const titleRaw = (form.get("title") as string | null) || "";

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "Aucun fichier reçu." },
        { status: 400 }
      );
    }
    if (!titleRaw.trim()) {
      return NextResponse.json(
        { status: "error", message: "Titre manquant." },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------
       NORMALISATION DU TITRE → nom de fichier
    --------------------------------------------------------- */
    let title = titleRaw.trim().replace(/\s+/g, "_");
    title = title.replace(/[^A-Za-z0-9_\-]/g, ""); // sécurité
    const ext = "jpg";

    const originalName = `${title}_original.${ext}`;
    const rectName = `${title}_rect.${ext}`;
    const squareName = `${title}_square.${ext}`;

    const dir = getUploadDir(category);
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());

    /* ---------------------------------------------------------
       ORIGINAL
    --------------------------------------------------------- */
    const originalBuf = await optimizeOriginal(buffer);
    const originalPath = path.join(dir, originalName);
    await writeFile(originalPath, originalBuf);

    /* ---------------------------------------------------------
       RECTANGLE
    --------------------------------------------------------- */
    const rectBuf = await createRectangle(buffer);
    const rectPath = path.join(dir, rectName);
    await writeFile(rectPath, rectBuf);

    /* ---------------------------------------------------------
       SQUARE
    --------------------------------------------------------- */
    const squareBuf = await createSquare(buffer);
    const squarePath = path.join(dir, squareName);
    await writeFile(squarePath, squareBuf);

    /* ---------------------------------------------------------
       REGISTER IN BACKEND (avec TITLE !)
    --------------------------------------------------------- */
    const regOriginal = await registerMedia(
      `/uploads/media/${category}/${originalName}`,
      "original",
      titleRaw          // 🆕 version non-normalisée stockée en BQ
    );

    const regRect = await registerMedia(
      `/uploads/media/${category}/${rectName}`,
      "rectangle",
      titleRaw
    );

    const regSquare = await registerMedia(
      `/uploads/media/${category}/${squareName}`,
      "square",
      titleRaw
    );

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

