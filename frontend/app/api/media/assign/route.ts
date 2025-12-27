import { NextResponse } from "next/server";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${BACKEND}/api/media/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  return NextResponse.json(json);
}
