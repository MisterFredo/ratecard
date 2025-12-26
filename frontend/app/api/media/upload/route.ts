export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Destination réelle
function getUploadDir(category: string) {
  return path.join(process.cwd(), "uploads", "media", category);
}

// Génère square 1:1
async function generateSquare(buffer: Buffer, size = 600) {
  return sharp(buffer)
    .rotate() // EXIF auto-rotation
    .resize(size, size, {
      fit: "cover",
      position: "centre"
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

// Génère rectangulaire (ex: 16/9)
async function generateRectangle(buffer: Buffer, width = 1200) {
  return sharp(buffer)
    .rotate()
    .resize({
      width,
      height: Math.round(width * 9 / 16),
      fit: "cover",
      position: "centre"
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

// Génère original optimisé (max 2000px)
async function optimizeOriginal(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const category = (form.get("category") as string) || "articles";

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "Fichier manquant" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const now = Date.now();
    const safeName = file.name.replace(/\s+/g, "-");

    const destDir = getUploadDir(category);
    await mkdir(destDir, { recursive: true });

    // 1️⃣ ORIGINAL HD OPTIMISÉ
    const original = await optimizeOriginal(buffer);
    const originalName = `${now}_${safeName}`;
    await writeFile(path.join(destDir, originalName), original);

    // 2️⃣ RECTANGLE (16/9)
    const rect = await generateRectangle(buffer);
    const rectName = `${now}_${safeName.replace(".", "_rect.")}`;
    await writeFile(path.join(destDir, rectName), rect);

    // 3️⃣ SQUARE (1:1)
    const square = await generateSquare(buffer);
    const squareName = `${now}_${safeName.replace(".", "_square.")}`;
    await writeFile(path.join(destDir, squareName), square);

    return NextResponse.json({
      status: "ok",
      items: {
        original: {
          url: `/media/${category}/${originalName}`,
          id: originalName,
        },
        rectangle: {
          url: `/media/${category}/${rectName}`,
          id: rectName,
        },
        square: {
          url: `/media/${category}/${squareName}`,
          id: squareName,
        }
      }
    });

  } catch (err: any) {
    console.error("❌ Erreur upload Sharp:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
