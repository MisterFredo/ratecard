export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function getDir() {
  return path.join(process.cwd(), "uploads", "articles");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "Aucun fichier" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const base = file.name.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");

    const dir = getDir();
    await mkdir(dir, { recursive: true });

    // RECTANGLE
    const rectBuf = await sharp(buffer)
      .resize(1200, 900, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const rectName = `${timestamp}_${base}_rect.jpg`;
    const rectPath = path.join(dir, rectName);
    await writeFile(rectPath, rectBuf);

    // SQUARE
    const squareBuf = await sharp(buffer)
      .resize(600, 600, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const squareName = `${timestamp}_${base}_square.jpg`;
    const squarePath = path.join(dir, squareName);
    await writeFile(squarePath, squareBuf);

    return NextResponse.json({
      status: "ok",
      rectangle_url: `/media/articles/${rectName}`,
      square_url: `/media/articles/${squareName}`,
    });

  } catch (err: any) {
    console.error("❌ Upload error (article) :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
