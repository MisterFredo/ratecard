// 👇 Important : force l'utilisation du runtime Node
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const BACKEND = process.env.RATECARD_BACKEND_URL!;

/* ---------------------------------------------------------
   Call backend to register media in BigQuery
--------------------------------------------------------- */
async function registerMedia(filepath: string, format: string) {
  const res = await fetch(`${BACKEND}/api/media/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filepath, format }),
  });
  return res.json();
}

/* ---------------------------------------------------------
   ROUTE
--------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, excerpt, axes, company } = body;

    // 1) Dynamic import OpenAI
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 2) Prompt IA
    const prompt = `
Tu es un illustrateur professionnel qui dessine dans le style Ratecard / AdEx :

- ligne claire noire très lisible
- bleu foncé #10323d
- accents gris et bleu clair
- un personnage cartoon gladiateur moderne
- style éditorial tech / adtech
- zéro réalisme
- fond gris très clair

Titre : ${title}
Résumé : ${excerpt}
Axes : ${axes?.join(", ") || "—"}
Société : ${company || "—"}

Produit une image carrée 1024x1024 SANS TEXTE.
    `;

    // 3) Génération OpenAI
    const img = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64 = img.data[0].b64_json!;
    const buffer = Buffer.from(base64, "base64");

    // 4) Save locally
    const now = Date.now();
    const category = "articles/generated";
    const baseDir = path.join(process.cwd(), "uploads", "media", category);
    await mkdir(baseDir, { recursive: true });

    const squareName = `ia_${now}_square.jpg`;
    const rectName = `ia_${now}_rect.jpg`;

    const squarePath = path.join(baseDir, squareName);
    const rectPath = path.join(baseDir, rectName);

    // Save square
    await writeFile(squarePath, buffer);

    // Generate rectangle
    const rectangle = await sharp(buffer)
      .resize(1200, 628, { fit: "cover", position: "center" })
      .jpeg({ quality: 90 })
      .toBuffer();
    await writeFile(rectPath, rectangle);

    // 5) Register media in backend (instead of BigQuery here)
    const squarePublic = `/uploads/media/${category}/${squareName}`;
    const rectPublic = `/uploads/media/${category}/${rectName}`;

    const regSquare = await registerMedia(squarePublic, "square");
    const regRect = await registerMedia(rectPublic, "rectangle");

    // 6) Return response
    return NextResponse.json({
      status: "ok",
      items: {
        square: {
          media_id: regSquare.media_id,
          url: `/media/${category}/${squareName}`,
        },
        rectangle: {
          media_id: regRect.media_id,
          url: `/media/${category}/${rectName}`,
        },
      },
    });

  } catch (err: any) {
    console.error("Erreur génération IA :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}


