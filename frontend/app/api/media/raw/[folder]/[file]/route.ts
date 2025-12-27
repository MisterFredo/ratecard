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

    // Chemin physique
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "media",
      folder,
      file
    );

    // Lecture du fichier
    const data = await readFile(filePath);

    // Détection du type MIME
    const type = mime.getType(file) || "application/octet-stream";

    // ⚠️ Correctif TypeScript + Next.js
    // NextResponse n’accepte pas Buffer → conversion en Uint8Array
    const uint8 = new Uint8Array(data);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": type,

        // 🚫 IMPORTANT : Pas de cache → sinon suppression/upload non visibles
        "Cache-Control": "no-store",

        // Option alternative si tu veux :
        // "Cache-Control": "max-age=0, must-revalidate"
      },
    });

  } catch (err) {
    console.error("❌ File not found:", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
