import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const CATEGORIES = [
  "logos",
  "logos-cropped",
  "articles",
  "articles/generated",
  "generics",
];

function detectType(filename: string) {
  if (filename.includes("_square")) return "square";
  if (filename.includes("_rect")) return "rect";
  return "original";
}

function getUploadRoot() {
  const root = path.join(process.cwd(), "uploads", "media");
  console.log("📁 LISTING ROOT:", root);
  return root;
}

async function listCategory(folder: string) {
  const folderPath = path.join(getUploadRoot(), folder);

  console.log("🔍 SCANNING:", folderPath);

  try {
    const entries = await readdir(folderPath);

    const items = [];

    for (const entry of entries) {
      if (entry.startsWith(".")) continue;

      const full = path.join(folderPath, entry);
      const info = await stat(full);

      if (info.isDirectory()) continue;

      items.push({
        id: entry,
        url: `/media/${folder}/${entry}`,
        folder,
        type: detectType(entry),
        size: info.size,
        createdAt: info.mtimeMs,
      });
    }

    console.log(`📦 FOUND ${items.length} items in ${folder}`);

    return items;

  } catch (e) {
    console.log(`⚠️ Folder missing: ${folderPath}`);
    return [];
  }
}

export async function GET() {
  try {
    const media = [];

    for (const folder of CATEGORIES) {
      const files = await listCategory(folder);
      media.push(...files);
    }

    media.sort((a, b) => b.createdAt - a.createdAt);

    console.log("📊 TOTAL MEDIA FOUND:", media.length);

    return NextResponse.json({
      status: "ok",
      media,
    });

  } catch (err: any) {
    console.error("❌ Erreur API media/list :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
