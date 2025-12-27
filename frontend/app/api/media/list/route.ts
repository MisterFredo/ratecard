export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const BACKEND = process.env.RATECARD_BACKEND_URL!;
let GCS_BASE_URL = process.env.GCS_BASE_URL!;

// 🔥 Normalisation sûre
GCS_BASE_URL = GCS_BASE_URL.replace(/\/+$/, "");   // retire slash fin

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/media/list`);
    const json = await res.json();

    if (json.status !== "ok") {
      return NextResponse.json(json);
    }

    const media = [];

    for (const m of json.media) {
      const filepath = m.FILEPATH || "";
      const parts = filepath.split("/");

      const folder = (parts[0] || "").toLowerCase();
      const filename = parts[1] || "";

      // 🔥 URL GCS propre (plus aucun risque)
      const url = `${GCS_BASE_URL}/${folder}/${filename}`;

      media.push({
        media_id: m.ID_MEDIA,
        folder,
        filename,
        url,
        title: m.TITLE || filename,
        format: m.FORMAT?.toLowerCase() || null,
        type: m.FORMAT?.toLowerCase() || null,
        entity_type: m.ENTITY_TYPE,
        entity_id: m.ENTITY_ID,
        createdAt: m.CREATED_AT,
        size: null,
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
