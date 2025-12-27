import { NextResponse } from "next/server";
import { unlink, stat } from "fs/promises";
import path from "path";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

/* Convert /media/folder/file to physical FS path */
function resolvePhysicalPath(url: string) {
  const relative = url.replace("/media/", "");
  return path.join(process.cwd(), "uploads", "media", relative);
}

export async function POST(req: Request) {
  const { url, media_id } = await req.json();

  if (!url) {
    return NextResponse.json({ status: "error", message: "Missing URL" });
  }

  const filePath = resolvePhysicalPath(url);

  const exists = await stat(filePath).catch(() => false);
  if (exists && !exists.isDirectory()) {
    await unlink(filePath).catch(() => {});
  }

  if (media_id) {
    await fetch(`${BACKEND}/api/media/delete/${media_id}`, {
      method: "DELETE",
    });
  }

  return NextResponse.json({ status: "ok", deleted: true });
}
