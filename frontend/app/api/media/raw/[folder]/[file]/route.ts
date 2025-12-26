import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req, { params }) {
  const { folder, file } = params;

  const filePath = path.join(
    process.cwd(),
    "uploads",
    "media",
    folder,
    file
  );

  try {
    const data = await readFile(filePath);

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
      },
    });

  } catch (err) {
    console.error("❌ File not found:", filePath);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
