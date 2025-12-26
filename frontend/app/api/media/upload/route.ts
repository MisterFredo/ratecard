export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function getUploadDir(category: string) {
  return path.join(process.cwd(), "uploads", "media", category);
}

// Square = 600×600
async function createSquare(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(600, 600, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

// Rectangle = 4:3 → 1200×900
async function createRectangle(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(1200, 900, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

// Original optimisé, max 2000px
async function optimizeOriginal(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/* ---------------------------------------------------------
   ROUTE UPLOAD
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

    /* ----------------------------------------------
       1) ORIGINAL OPTIMISÉ
    ---------------------------------------------- */
    const original = await optimizeOriginal(buffer);
    const originalName = `${now}_${baseName}`;
    await writeFile(path.join(dir, originalName), original);

    /* ----------------------------------------------
       2) RECTANGLE (4:3)
    ---------------------------------------------- */
    const rect = await createRectangle(buffer);
    const rectName = `${now}_${baseName.replace(".", "_rect.")}`;
    await writeFile(path.join(dir, rectName), rect);

    /* ----------------------------------------------
       3) SQUARE (1:1)
    ---------------------------------------------- */
    const square = await createSquare(buffer);
    const squareName = `${now}_${baseName.replace(".", "_square.")}`;
    await writeFile(path.join(dir, squareName), square);

    /* ----------------------------------------------
       RÉPONSE JSON
    ---------------------------------------------- */
    return NextResponse.json({
      status: "ok",
      items: {
        original: {
          id: originalName,
          url: `/media/${category}/${originalName}`,
          folder: category,
        },
        rectangle: {
          id: rectName,
          url: `/media/${category}/${rectName}`,
          folder: category,
        },
        square: {
          id: squareName,
          url: `/media/${category}/${squareName}`,
          folder: category,
        },
      },
    });

  } catch (err: any) {
    console.error("❌ Sharp upload error :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
