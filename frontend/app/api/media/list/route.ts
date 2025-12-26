import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// Mapping folder to category names
const CATEGORY_MAP: Record<string, string> = {
  "logos": "logos",
  "logos-cropped": "logosCropped",
  "articles": "articles",
  "articles/generated": "ia",
  "generics": "generics",
};

const FOLDERS = Object.keys(CATEGORY_MAP);

// Detect frontend root regardless of cwd
function getFrontendRoot() {
  return path.join(process.cwd(), "frontend");
}

// Persistent upload directory
function getUploadRoot() {
  const root = path.join(getFrontendRoot(), "uploads", "media");
  console.log("📁 LIST root =", root);
  return root;
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
        category: CATEGORY_MAP[folder],
        type: detectType(entry),
        size: info.size,
        createdAt: info.mtimeMs,
      });
    }

    console.log(`📦 FOUND ${items.length} in ${folder}`);
    return items;

  } catch (e) {
    console.log("⚠️ Folder missing:", folderPath);
    return [];
  }
}

export async function GET() {
  const media: any[] = [];

  for (const folder of FOLDERS) {
    const items = await listFolder(folder);
    media.push(...items);
  }

  media.sort((a, b) => b.createdAt - a.createdAt);

  console.log("📊 TOTAL MEDIA:", media.length);

  return NextResponse.json({
    status: "ok",
    media,
  });
}
