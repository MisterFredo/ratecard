import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// Dossiers supportés
const CATEGORIES = [
  "logos",
  "logos-cropped",
  "articles",
  "articles/generated",
  "generics",
];

// Types d’image dérivés du nom
function detectType(filename: string) {
  if (filename.includes("_square")) return "square";
  if (filename.includes("_rect")) return "rect";
  return "original";
}

// Racine PERSISTANTE
function getUploadRoot() {
  return path.join(process.cwd(), "uploads", "media");
}

// Liste tous les médias d’un dossier
async function listCategory(folder: string) {
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
        type: detectType(entry),
        size: info.size,
        createdAt: info.mtimeMs,
      });
    }

    return items;

  } catch (e) {
    // Dossier manquant → aucun média
    return [];
  }
}

// Route GET
export async function GET() {
  try {
    const media: any[] = [];

    for (const folder of CATEGORIES) {
      const files = await listCategory(folder);
      media.push(...files);
    }

    // Tri décroissant (plus récents en haut)
    media.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      status: "ok",
      media,
    });

  } catch (err: any) {
    console.error("Erreur API media/list :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
