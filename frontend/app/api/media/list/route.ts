import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

// ------------------------------------------------------
// Helper sécurisé : liste uniquement les FICHIERS images
// ------------------------------------------------------
async function safeList(folder: string) {
  try {
    const dir = path.join(process.cwd(), "public", "media", folder);
    const entries = await readdir(dir);

    const filesOnly: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const info = await stat(fullPath);

      // ignore les dossiers
      if (info.isDirectory()) continue;

      // garde seulement les images
      if (
        VALID_EXTENSIONS.some((ext) =>
          entry.toLowerCase().endsWith(ext)
        )
      ) {
        filesOnly.push(`/media/${folder}/${entry}`);
      }
    }

    return filesOnly;
  } catch {
    return [];
  }
}

export async function GET() {
  const logos = await safeList("logos");
  const logosCropped = await safeList("logos-cropped");
  const articles = await safeList("articles");
  const generics = await safeList("generics");

  // Sous-dossier pour visuels IA générés
  const generated = await safeList("articles/generated");

  return NextResponse.json({
    status: "ok",
    media: {
      logos,
      logosCropped,
      articles,
      generics,
      generated,
    },
  });
}
