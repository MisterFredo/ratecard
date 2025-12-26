import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// Mapping folder -> category logical key expected by frontend
const CATEGORY_MAP: Record<string, string> = {
  "logos": "logos",
  "logos-cropped": "logosCropped",
  "articles": "articles",
  "articles/generated": "ia",
  "generics": "generics",
};

const FOLDERS = Object.keys(CATEGORY_MAP);

function detectType(filename: string) {
  if (filename.includes("_square")) return "square";
  if (filename.includes("_rect")) return "rect";
  return "original";
}

function getUploadRoot() {
  return path.join(process.cwd(), "uploads", "media");
}

async function listFolder(folder: string) {
  const folderPath = path.join(getUploadRoot(), folder);

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
        category: CATEGORY_MAP[folder],   // ← 🔥 IMPORTANT !
        type: detectType(entry),
        size: info.size,
        createdAt: info.mtimeMs,
      });
    }

    return items;

  } catch (e) {
    return [];
  }
}

export async function GET() {
  try {
    let all: any[] = [];

    for (const f of FOLDERS) {
      const list = await listFolder(f);
      all = all.concat(list);
    }

    all.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      status: "ok",
      media: all,
    });

  } catch (err: any) {
    console.error("Erreur API media/list :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
