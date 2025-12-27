export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const BACKEND = process.env.RATECARD_BACKEND_URL!;
const GCS_BASE_URL = process.env.GCS_BASE_URL!; // 🔥 https://storage.googleapis.com/ratecard-media

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/media/list`);
    const json = await res.json();

    if (json.status !== "ok") {
      return NextResponse.json(json);
    }

    const media = [];

    for (const m of json.media) {
      // Exemple m.FILEPATH = "logos/Logo_BESPOKE_rect.jpg"
      const filepath = m.FILEPATH || "";
      const parts = filepath.split("/");

      const folder = parts[0]?.toLowerCase() || "unknown";
      const filename = parts[1] || "";

      // 🔥 URL GCS PUBLIQUE
      const url = `${GCS_BASE_URL}/${folder}/${filename}`;

      media.push({
        media_id: m.ID_MEDIA,
        folder,
        filename,

        // GCS URL directe
        url,

        // Lecture gouvernée
        title: m.TITLE || filename,

        // Normalisation format
        format: m.FORMAT?.toLowerCase() || null,
        type: m.FORMAT?.toLowerCase() || null,

        // Assignation d'entité
        entity_type: m.ENTITY_TYPE,
        entity_id: m.ENTITY_ID,

        // Taille : plus disponible → on laisse null
        size: null,

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



