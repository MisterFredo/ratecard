import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

// ------------------------------------------------------
// Helper sécurisé : liste les images uniquement
// ------------------------------------------------------
async function safeList(folder: string) {
  try {
    const dir = path.join(process.cwd(), "public", "media", folder);
    const files = await readdir(dir);

    return files
      .filter((f) =>
        VALID_EXTENSIONS.some((ext) => f.toLowerCase().endsWith(ext))
      )
      .map((f) => `/media/${folder}/${f}`);

  } catch {
    console.warn(`⚠️ Dossier manquant : media/${folder}`);
    return [];
  }
}

export async function GET() {
  const logos = await safeList("logos");
  const logosCropped = await safeList("logos-cropped");
  const articles = await safeList("articles");
  const generics = await safeList("generics");

  return NextResponse.json({
    status: "ok",
    media: {
      logos,
      logosCropped,
      articles,
      generics,
    },
  });
}
