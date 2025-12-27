export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { unlink, stat, Stats } from "fs/promises";
import path from "path";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

// Convert /media/folder/file → physical path
function resolvePhysicalPath(url: string) {
  const relative = url.replace("/media/", "");
  return path.join(process.cwd(), "uploads", "media", relative);
}

export async function POST(req: Request) {
  try {
    const { url, media_id } = await req.json();

    if (!url) {
      return NextResponse.json(
        { status: "error", message: "Missing URL" },
        { status: 400 }
      );
    }

    const filePath = resolvePhysicalPath(url);

    // 🔧 FIX TypeScript: always resolve to Stats | null
    let fileStat: Stats | null = null;
    try {
      fileStat = await stat(filePath);
    } catch {
      fileStat = null;
    }

    // Delete physical file only if it exists and is not a directory
    if (fileStat && !fileStat.isDirectory()) {
      await unlink(filePath).catch(() => {});
    }

    // Notify backend to delete BQ row
    if (media_id) {
      await fetch(`${BACKEND}/api/media/delete/${media_id}`, {
        method: "DELETE",
      });
    }

    return NextResponse.json({ status: "ok", deleted: true });
  } catch (err: any) {
    console.error("❌ Error delete:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
