export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

/*
  Cette route :
  1) récupère la liste brute depuis le backend FastAPI
  2) transforme FILEPATH => URL publique Next.js (/media/...)
  3) envoie un format compatible MediaPicker et Médiathèque
*/
export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/media/list`);
    const json = await res.json();

    if (json.status !== "ok") {
      return NextResponse.json(json);
    }

    const media = json.media.map((m: any) => {
      // FILEPATH = "/uploads/media/<folder>/<filename>"
      const relative = m.FILEPATH.replace("/uploads/media/", "");

      const folder = relative.split("/")[0];
      const filename = relative.split("/")[1];

      return {
        media_id: m.ID_MEDIA,
        format: m.FORMAT,
        entity_type: m.ENTITY_TYPE,
        entity_id: m.ENTITY_ID,

        // URL publique servie par /api/media/raw/[folder]/[file]
        url: `/media/${folder}/${filename}`,

        // Pour MediaPicker
        folder,
        type: m.FORMAT,

        // Dates
        createdAt: m.CREATED_AT,
      };
    });

    return NextResponse.json({ status: "ok", media });

  } catch (err: any) {
    console.error("❌ Error list:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
