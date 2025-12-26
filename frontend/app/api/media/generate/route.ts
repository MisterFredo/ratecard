// 👇 Important : force l'utilisation du runtime Node et non Edge
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";  // remplace canvas

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, excerpt, axes, company } = body;

    // ============================================================
    // 1) Dynamic import -> évite les erreurs "openai not found" au build
    // ============================================================
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ============================================================
    // 2) Prompt IA style Ratecard / AdEx
    // ============================================================
    const prompt = `
Tu es un illustrateur professionnel qui dessine dans le style Ratecard / AdEx :

- ligne claire noire très lisible
- bleu foncé #10323d
- accents gris et bleu clair
- un personnage cartoon gladiateur moderne (mascotte Ratecard / AdEx)
- style éditorial tech / adtech
- zéro réalisme, zéro texture
- fond gris très clair
- composition simple et épurée

Détails de l’article :
Titre : ${title}
Résumé : ${excerpt}
Axes : ${axes?.join(", ") || "—"}
Société : ${company || "—"}

Produit une image carrée 1024x1024 SANS TEXTE.
    `;

    // ============================================================
    // 3) Génération IA via OpenAI
    // ============================================================
    const img = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64 = img.data[0].b64_json!;
    const buffer = Buffer.from(base64, "base64");

    // ============================================================
    // 4) SAVE square image
    // ============================================================
    const now = Date.now();
    const squareName = `ia_${now}_square.jpg`;
    const rectName = `ia_${now}_rect.jpg`;

    const squarePath = path.join(
      process.cwd(),
      "public",
      "media",
      "articles/generated",
      squareName
    );

    const rectPath = path.join(
      process.cwd(),
      "public",
      "media",
      "articles/generated",
      rectName
    );

    // Enregistre l'image carrée
    await writeFile(squarePath, buffer);

    // ============================================================
    // 5) Génération du rectangle avec sharp (1200x628)
    // ============================================================
    const rectangle = await sharp(buffer)
      .resize(1200, 628, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    await writeFile(rectPath, rectangle);

    // ============================================================
    // 6) RETURN URLs
    // ============================================================
    return NextResponse.json({
      status: "ok",
      urls: {
        square: `/media/articles/generated/${squareName}`,
        rectangle: `/media/articles/generated/${rectName}`,
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
