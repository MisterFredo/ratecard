import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// --------- Helper sécurisé ---------
async function safeList(folder: string) {
  try {
    const dir = path.join(process.cwd(), "public", "media", folder);
    const files = await readdir(dir);

    return files.map((f) => `/media/${folder}/${f}`);
  } catch (e) {
    // En production, on ne veut pas de crash pour un dossier manquant
    console.warn(`⚠️ Dossier manquant (media/${folder}) — retourné vide`);
    return [];
  }
}

export async function GET() {
  try {
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
        generics
      },
    });

  } catch (err: any) {
    console.error("Erreur API media/list", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
