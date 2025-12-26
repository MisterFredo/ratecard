import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

const CATEGORIES = ["articles", "logos", "logos-cropped", "generics", "articles/generated"];

function getUploadRoot() {
  return path.join(process.cwd(), "uploads", "media");
}

async function listCategory(folder: string) {
  const base = path.join(getUploadRoot(), folder);

  try {
    const files = await readdir(base);

    const items = [];

    for (const file of files) {
      if (file.startsWith(".")) continue;

      const fullPath = path.join(base, file);
      const info = await stat(fullPath);

      items.push({
        id: file,
        url: `/media/${folder}/${file}`,
        folder,
        size: info.size,
        createdAt: info.mtimeMs,
      });
    }

    return items;

  } catch (err) {
    console.log("⚠️ No folder:", folder);
    return [];
  }
}

export async function GET() {
  const result: Record<string, any[]> = {};

  for (const folder of CATEGORIES) {
    result[folder] = await listCategory(folder);
  }

  return NextResponse.json({
    status: "ok",
    media: result,
  });
}
