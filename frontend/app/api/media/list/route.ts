export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

/**
 * Proxy direct vers le backend FastAPI.
 * Le backend renvoie l'ensemble des médias (ID_MEDIA, FILEPATH, FORMAT,
 * ENTITY_TYPE, ENTITY_ID, CREATED_AT…)
 */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/media/list`);
    const json = await res.json();
    return NextResponse.json(json);

  } catch (err: any) {
    console.error("❌ Error list:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
