import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// Extensions valides
const VALID_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

// Mapping dossier → catégorie logique
const CATEGORY_MAP: Record<string, string> = {
  "logos": "logos",
  "logos-cropped": "logosCropped",
  "articles": "articles",
  "articles/generated": "ia",
  "generics": "generics",
};

// Mapping filename → type logique
function detectType(filename: string) {
  if (filename.includes("_square")) return "square";
  if (filename.includes("_rect")) return "rect";
  return "original"; // upload manuel ou fichier non suffixé
}

// Récupère les médias d'un dossier (sans parcourir récursivement)
async function listFolder(relative: string) {
  const folderPath = path.join(process.cwd(), "public", "media", relative);

  try {
    const entries = await readdir(folderPath);

    const files: any[] = [];

    for (const entry of entries) {
      const full = path.join(folderPath, entry);
      const info = await stat(full);

      // Ignore les dossiers
      if (info.isDirectory()) continue;

      // Ignore les fichiers non images
      if (!VALID_EXT.some((ext) => entry.toLowerCase().endsWith(ext))) continue;

      files.push({
        id: entry,
        url: `/media/${relative}/${entry}`,
        folder: relative,
        category: CATEGORY_MAP[relative] ?? "other",
        type: detectType(entry),
        size: info.size,
        createdAt: info.mtimeMs,
      });
    }

    return files;
  } catch (e) {
    // Le dossier peut ne pas exister → on renvoie simplement vide
    return [];
  }
}

export async function GET() {
  try {
    const folders = [
      "logos",
      "logos-cropped",
      "articles",
      "articles/generated",
      "generics",
    ];

    let all: any[] = [];

    for (const f of folders) {
      const list = await listFolder(f);
      all = all.concat(list);
    }

    // Tri décroissant par date de création (le plus récent en premier)
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
