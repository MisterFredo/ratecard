import { NextResponse } from "next/server";
import { unlink, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Important pour accès FS

// Exemple d’URL reçue : /media/articles/xxxx_rect.jpg
// On doit convertir en chemin physique : uploads/media/articles/xxxx_rect.jpg
function resolvePhysicalPath(url: string) {
  // URL publique -> /media/<folder>/<file>
  const relative = url.replace("/media/", ""); // "articles/xxx.jpg"

  // Emplacement réel en production :
  return path.join(process.cwd(), "uploads", "media", relative);
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { status: "error", message: "URL manquante" },
        { status: 400 }
      );
    }

    if (!url.startsWith("/media/")) {
      return NextResponse.json(
        { status: "error", message: "Chemin invalide" },
        { status: 400 }
      );
    }

    const filePath = resolvePhysicalPath(url);
    console.log("🗑 SUPPRESSION :", filePath);

    const info = await stat(filePath).catch(() => null);

    if (!info) {
      return NextResponse.json(
        { status: "error", message: "Fichier introuvable" },
        { status: 404 }
      );
    }

    if (info.isDirectory()) {
      return NextResponse.json(
        { status: "error", message: "Impossible de supprimer un dossier" },
        { status: 400 }
      );
    }

    await unlink(filePath);

    return NextResponse.json({
      status: "ok",
      deleted: url,
    });

  } catch (err: any) {
    console.error("❌ Erreur suppression fichier :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
