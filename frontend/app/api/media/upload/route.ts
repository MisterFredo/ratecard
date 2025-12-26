export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { writeFile, mkdir, stat } from "fs/promises";
import path from "path";

const CATEGORY_FOLDER: Record<string, string> = {
  "logo": "logos",
  "logo-cropped": "logos-cropped",
  "article": "articles",
  "generic": "generics",
  "ia": "articles/generated",
};

function detectType(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.includes("_square")) return "square";
  if (lower.includes("_rect")) return "rect";
  return "original";
}

async function buildMediaItem(folder: string, filename: string) {
  const filePath = path.join(
    process.cwd(),
    "frontend",
    "public",
    "media",
    folder,
    filename
  );

  const info = await stat(filePath);

  return {
    id: filename,
    url: `/media/${folder}/${filename}`,
    folder,
    category: folder,
    type: detectType(filename),
    size: info.size,
    createdAt: info.mtimeMs,
  };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const square = form.get("square") as File | null;
    const rectangle = form.get("rectangle") as File | null;
    const category = (form.get("category") as string) || "article";

    if (!square || !rectangle) {
      return NextResponse.json(
        { status: "error", message: "square + rectangle requis" },
        { status: 400 }
      );
    }

    const folder = CATEGORY_FOLDER[category] || "articles";
    const now = Date.now();

    const squareName = `${now}_${square.name}`;
    const rectName = `${now}_${rectangle.name}`;

    const baseDir = path.join(
      process.cwd(),
      "frontend",
      "public",
      "media",
      folder
    );

    await mkdir(baseDir, { recursive: true });

    const squareBuf = Buffer.from(await square.arrayBuffer());
    const rectBuf = Buffer.from(await rectangle.arrayBuffer());

    await writeFile(path.join(baseDir, squareName), squareBuf);
    await writeFile(path.join(baseDir, rectName), rectBuf);

    const squareItem = await buildMediaItem(folder, squareName);
    const rectItem = await buildMediaItem(folder, rectName);

    return NextResponse.json({
      status: "ok",
      items: {
        square: squareItem,
        rectangle: rectItem,
      },
    });
  } catch (err: any) {
    console.error("Erreur upload média :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
