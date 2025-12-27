export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import path from "path";
import { stat } from "fs/promises";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/media/list`);
    const json = await res.json();

    if (json.status !== "ok") {
      return NextResponse.json(json);
    }

    const media = [];

    for (const m of json.media) {
      // FILEPATH = "/uploads/media/<folder>/<filename>"
      const relative = m.FILEPATH.replace("/uploads/media/", "");

      let [folder, filename] = relative.split("/");

      // 🔥 NORMALISATION CRITIQUE
      folder = folder.toLowerCase();

      // Chemin physique pour récupérer la taille réelle
      const physicalPath = path.join(
        process.cwd(),
        "uploads",
        "media",
        folder,
        filename
      );

      let size = null;
      try {
        const stats = await stat(physicalPath);
        size = stats.size; // en octets
      } catch {
        size = null;
      }

      media.push({
        media_id: m.ID_MEDIA,

        // 🔥 FORMAT NORMALISÉ
        format: m.FORMAT?.toLowerCase() || null,

        entity_type: m.ENTITY_TYPE,
        entity_id: m.ENTITY_ID,

        // URL publique servie par Next.js
        url: `/media/${folder}/${filename}`,

        // Nouveau champ lisible
        title: m.TITLE || filename,
        filename,

        // 🔥 Catégorie = dossier normalisé en minuscule
        folder,

        // Compatibilité MediaPicker (ancien type)
        type: m.FORMAT?.toLowerCase() || null,

        // Taille récupérée localement
        size,

        createdAt: m.CREATED_AT,
      });
    }

    return NextResponse.json({ status: "ok", media });

  } catch (err: any) {
    console.error("❌ Error list:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}


