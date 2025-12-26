export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

const CATEGORIES = {
  "logos": "logos",
  "logos-cropped": "logosCropped",
  "articles": "articles",
  "articles/generated": "ia",
  "generics": "generics",
};

function getUploadRoot() {
  return path.join(process.cwd(), "frontend", "uploads", "media");
}

function detectType(filename: string) {
  if (filename.includes("_square")) return "square";
  if (filename.includes("_rect")) return "rect";
  return "original";
}

async function listFolder(folder: string) {
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
        category: CATEGORIES[folder],
        size: info.size,
        type: detectType(entry),
        createdAt: info.mtimeMs,
      });
    }

    console.log(`📦 FOUND ${items.length} in ${folder}`);
    return items;

  } catch (err) {
    console.log("⚠️ Missing folder:", folderPath);
    return [];
  }
}

export async function GET() {
  try {
    console.log("📌 LIST CALLED");

    let media: any[] = [];

    for (const folder of Object.keys(CATEGORIES)) {
      const files = await listFolder(folder);
      media = media.concat(files);
    }

    media.sort((a, b) => b.createdAt - a.createdAt);

    console.log("📊 TOTAL:", media.length);

    return NextResponse.json({ status: "ok", media });

  } catch (err: any) {
    console.error("❌ Error list:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
