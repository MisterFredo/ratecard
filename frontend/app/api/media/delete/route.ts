import { NextResponse } from "next/server";
import { unlink, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { status: "error", message: "URL manquante" },
        { status: 400 }
      );
    }

    // On ne supprime que ce qui est dans /public/media/**
    if (!url.startsWith("/media/")) {
      return NextResponse.json(
        { status: "error", message: "Chemin fichier invalide" },
        { status: 400 }
      );
    }

    // Résolution du chemin absolu
    const filePath = path.join(process.cwd(), "public", url.replace("/media/", "media/"));

    const fileInfo = await stat(filePath).catch(() => null);

    if (!fileInfo) {
      return NextResponse.json(
        { status: "error", message: "Fichier introuvable" },
        { status: 404 }
      );
    }

    // Sécurité : empêcher la suppression d’un dossier
    if (fileInfo.isDirectory()) {
      return NextResponse.json(
        { status: "error", message: "Impossible de supprimer un dossier" },
        { status: 400 }
      );
    }

    // Suppression du fichier
    await unlink(filePath);

    return NextResponse.json({
      status: "ok",
      deleted: url
    });

  } catch (err: any) {
    console.error("Erreur suppression fichier :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
