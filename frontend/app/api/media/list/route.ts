export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const BACKEND = process.env.RATECARD_BACKEND_URL;
    const RAW_GCS_BASE_URL = process.env.GCS_BASE_URL;

    if (!BACKEND) {
      console.error("❌ RATECARD_BACKEND_URL manquant au runtime");
      return NextResponse.json(
        { status: "error", message: "Missing backend URL" },
        { status: 500 }
      );
    }

    if (!RAW_GCS_BASE_URL) {
      console.error("❌ GCS_BASE_URL manquant au runtime");
      return NextResponse.json(
        { status: "error", message: "Missing GCS base URL" },
        { status: 500 }
      );
    }

    // 🔥 Normalisation locale, jamais en dehors
    const GCS_BASE_URL = RAW_GCS_BASE_URL.replace(/\/+$/, "");

    const res = await fetch(`${BACKEND}/api/media/list`, {
      cache: "no-store",
    });
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
