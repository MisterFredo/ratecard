export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function getUploadDir(category: string) {
  return path.join(process.cwd(), "uploads", "media", category);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const square = form.get("square") as File | null;
    const rectangle = form.get("rectangle") as File | null;
    const category = (form.get("category") as string) || "articles";

    if (!square || !rectangle) {
      return NextResponse.json(
        { status: "error", message: "Carré + rectangle requis" },
        { status: 400 }
      );
    }

    const destDir = getUploadDir(category);
    await mkdir(destDir, { recursive: true });

    const now = Date.now();

    // SQUARE
    const squareBuf = Buffer.from(await square.arrayBuffer());
    const squareName = `${now}_${square.name}`;
    await writeFile(path.join(destDir, squareName), squareBuf);

    // RECTANGLE
    const rectBuf = Buffer.from(await rectangle.arrayBuffer());
    const rectName = `${now}_${rectangle.name}`;
    await writeFile(path.join(destDir, rectName), rectBuf);

    // ORIGINAL (optionnel : recompose depuis rect)
    const originalName = `${now}_original.jpg`;
    const optimizedOriginal = await sharp(rectBuf)
      .rotate()
      .resize({ width: 2000, withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
    await writeFile(path.join(destDir, originalName), optimizedOriginal);

    return NextResponse.json({
      status: "ok",
      items: {
        square: {
          id: squareName,
          url: `/media/${category}/${squareName}`,
          folder: category,
        },
        rectangle: {
          id: rectName,
          url: `/media/${category}/${rectName}`,
          folder: category,
        }
      }
    });

  } catch (err: any) {
    console.error("❌ Upload error :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
