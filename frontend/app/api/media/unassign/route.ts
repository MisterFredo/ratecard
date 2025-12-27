import { NextResponse } from "next/server";
const BACKEND = process.env.RATECARD_BACKEND_URL!;

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${BACKEND}/api/media/unassign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json());
}
