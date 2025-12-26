import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { folder: string; file: string } }
) {
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

    // Convertir Buffer → Uint8Array (compatible Web API)
    const uint8 = new Uint8Array(data);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

  } catch (err) {
    console.error("❌ File not found:", filePath);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
