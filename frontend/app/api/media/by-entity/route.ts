import { NextResponse } from "next/server";
const BACKEND = process.env.RATECARD_BACKEND_URL!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  const res = await fetch(
    `${BACKEND}/api/media/by-entity?entity_type=${type}&entity_id=${id}`
  );

  return NextResponse.json(await res.json());
}
