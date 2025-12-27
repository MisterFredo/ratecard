import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import mime from "mime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { folder: string; file: string } }
) {
  try {
    const { folder, file } = params;

    // 🔒 Protection minimale contre path traversal
    if (folder.includes("..") || file.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "media",
      folder,
      file
    );

    const data = await readFile(filePath);
    const type = mime.getType(file) || "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

  } catch (err) {
    console.error("❌ File not found:", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

