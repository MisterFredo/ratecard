export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const BACKEND = process.env.RATECARD_BACKEND_URL;
    const GCS_BASE_URL = process.env.GCS_BASE_URL?.replace(/\/+$/, "");

    if (!BACKEND || !GCS_BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Missing env vars" },
        { status: 500 }
      );
    }

    const res = await fetch(`${BACKEND}/api/media/list`, { cache: "no-store" });
    const json = await res.json();

    if (json.status !== "ok") return NextResponse.json(json);

    const media = json.media.map((m: any) => {
      const filepath = m.FILEPATH || "";
      const parts = filepath.split("/");

      const folder = parts[0] || "";   // FIX CASE !
      const filename = parts[1] || "";

      return {
        media_id: m.ID_MEDIA,
        folder,
        filename,
        url: `${GCS_BASE_URL}/${folder}/${filename}`,   // GCS DIRECT
        title: m.TITLE || filename,
        format: m.FORMAT?.toLowerCase() || null,
        type: m.FORMAT?.toLowerCase() || null,
        entity_type: m.ENTITY_TYPE,
        entity_id: m.ENTITY_ID,
        createdAt: m.CREATED_AT,
        size: null,
      };
    });

    return NextResponse.json({ status: "ok", media });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
