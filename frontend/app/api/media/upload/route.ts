import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// ==========================================
// Helper global : choisit le bon dossier
// ==========================================
function getFolder(category: string | null, filename: string) {
  if (category === "logo") return "logos-cropped";
  if (category === "article") return "articles";
  if (category === "generic") return "generics";

  // Auto-détection de fallback
  const ext = filename.toLowerCase();
  if (ext.endsWith(".svg") || ext.includes("logo")) return "logos-cropped";

  return "articles";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const square = form.get("square") as File | null;
    const rectangle = form.get("rectangle") as File | null;
    const category = form.get("category") as string | null;

    if (!square || !rectangle) {
      return NextResponse.json(
        { status: "error", message: "Fichiers square + rectangle requis" },
        { status: 400 }
      );
    }

    const now = Date.now();

    const squareFolder = getFolder(category, square.name);
    const rectFolder = getFolder(category, rectangle.name);

    const squareFilename = `${now}_${square.name}`;
    const rectFilename = `${now}_${rectangle.name}`;

    const squarePath = path.join(
      process.cwd(),
      "public",
      "media",
      squareFolder,
      squareFilename
    );

    const rectPath = path.join(
      process.cwd(),
      "public",
      "media",
      rectFolder,
      rectFilename
    );

    // ==========================================
    // IMPORTANT : création auto des dossiers
    // ==========================================
    await mkdir(path.dirname(squarePath), { recursive: true });
    await mkdir(path.dirname(rectPath), { recursive: true });

    const squareBuf = Buffer.from(await square.arrayBuffer());
    const rectBuf = Buffer.from(await rectangle.arrayBuffer());

    await writeFile(squarePath, squareBuf);
    await writeFile(rectPath, rectBuf);

    return NextResponse.json({
      status: "ok",
      urls: {
        square: `/media/${squareFolder}/${squareFilename}`,
        rectangle: `/media/${rectFolder}/${rectFilename}`,
      },
    });

  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
