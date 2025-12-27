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

      const [folder, filename] = relative.split("/");

      // Chemin physique pour récupérer la taille
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
        format: m.FORMAT,
        entity_type: m.ENTITY_TYPE,
        entity_id: m.ENTITY_ID,

        // URL publique
        url: `/media/${folder}/${filename}`,

        // Ajout du filename lisible
        filename,

        // Catégorie = dossier
        folder,

        // Pour MediaPicker :
        type: m.FORMAT,

        // Taille en octets
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
