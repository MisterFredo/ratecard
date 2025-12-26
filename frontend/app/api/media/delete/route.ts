import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json(
        { status: "error", message: "URL manquante" },
        { status: 400 }
      );
    }

    // URL → filesystem path
    const filePath = path.join(process.cwd(), "public", url.replace("/media/", "media/"));

    await unlink(filePath);

    return NextResponse.json({ status: "ok", deleted: url });
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", message: e.message },
      { status: 500 }
    );
  }
}
