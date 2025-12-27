/** NEXT.JS — /api/media/upload */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sharp from "sharp";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

/* ---------------------------------------------------------
   Helper sécurisé
--------------------------------------------------------- */
async function registerMediaToBackend(
  base64: string,
  filename: string,
  format: string,
  title: string,
  category: string
) {
  const res = await fetch(`${BACKEND}/api/media/register-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename,
      category,
      format,
      title,
      base64,
    }),
  });

  const json = await res.json();

  if (json.status !== "ok") {
    console.error("❌ register-upload backend error:", json);
    throw new Error(json.message || "Erreur backend register-upload");
  }

  return json;
}

/* ---------------------------------------------------------
   MAIN ROUTE
--------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const category = (form.get("category") as string) || "logos";
    const titleRaw = (form.get("title") as string | null) || "";

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    if (!titleRaw.trim()) {
      return NextResponse.json(
        { status: "error", message: "Titre manquant." },
        { status: 400 }
      );
    }

    // Nom fichier propre
    let title = titleRaw.trim().replace(/\s+/g, "_");
    title = title.replace(/[^A-Za-z0-9_\-]/g, "");
    const ext = "jpg";

    const nameOriginal = `${title}_original.${ext}`;
    const nameRect = `${title}_rect.${ext}`;
    const nameSquare = `${title}_square.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    /* ---------------------------------------------------------
       Génération des 3 formats
    --------------------------------------------------------- */
    const bufOriginal = await sharp(buffer)
      .rotate()
      .resize({ width: 2000, withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    const bufRect = await sharp(buffer)
      .rotate()
      .resize(1200, 900, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const bufSquare = await sharp(buffer)
      .rotate()
      .resize(600, 600, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();

    /* ---------------------------------------------------------
       Upload + BQ via le backend GCS
    --------------------------------------------------------- */
    const regOriginal = await registerMediaToBackend(
      bufOriginal.toString("base64"),
      nameOriginal,
      "original",
      titleRaw,
      category
    );

    const regRect = await registerMediaToBackend(
      bufRect.toString("base64"),
      nameRect,
      "rectangle",
      titleRaw,
      category
    );

    const regSquare = await registerMediaToBackend(
      bufSquare.toString("base64"),
      nameSquare,
      "square",
      titleRaw,
      category
    );

    return NextResponse.json({
      status: "ok",
      items: {
        original: regOriginal.item,
        rectangle: regRect.item,
        square: regSquare.item,
      },
    });

  } catch (err: any) {
    console.error("❌ Upload GCS error:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Erreur upload GCS" },
      { status: 500 }
    );
  }
}



