import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, excerpt, axes, company } = body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ------------------------------------------------------------
    // 1) PROMPT STYLE Ratecard / AdEx
    // ------------------------------------------------------------
    const finalPrompt = `
Tu es un illustrateur professionnel qui dessine dans le style Ratecard / AdEx :

- ligne claire noire, très lisible
- couleur principale bleu foncé #10323d
- accents gris et bleu clair
- dessin simple, épuré, minimaliste
- un personnage cartoon type gladiateur moderne (mascotte Ratecard / AdEx)
- posture expressive mais sobre
- zéro réalisme, zéro texture
- fond gris très clair
- style éditorial "tech / adtech"
- composition claire avec un seul sujet principal

Thème de l’article :
Titre : ${title}
Résumé : ${excerpt}
Axes éditoriaux : ${axes?.join(", ") || "—"}
Société concernée : ${company || "—"}

Génère une image éditoriale cohérente, SANS TEXTE, adaptée à un article Ratecard.

FORMAT DEMANDÉ : carré 1024x1024.
    `;

    // ------------------------------------------------------------
    // 2) GENERATION VIA OPENAI IMAGES
    // ------------------------------------------------------------
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const b64 = response.data[0].b64_json!;
    const imgBuffer = Buffer.from(b64, "base64");

    // ------------------------------------------------------------
    // 3) SAVE ORIGINAL (square)
    // ------------------------------------------------------------
    const now = Date.now();
    const squareFilename = `ia_${now}_square.jpg`;
    const rectFilename = `ia_${now}_rect.jpg`;

    const squarePath = path.join(
      process.cwd(),
      "public",
      "media",
      "articles/generated",
      squareFilename
    );
    const rectPath = path.join(
      process.cwd(),
      "public",
      "media",
      "articles/generated",
      rectFilename
    );

    await writeFile(squarePath, imgBuffer);

    // ------------------------------------------------------------
    // 4) GENERATE RECTANGLE VERSION (1200×628)
    // ------------------------------------------------------------
    const img = await loadImage(imgBuffer);
    const WIDTH = 1200;
    const HEIGHT = 628;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    const ratio = WIDTH / HEIGHT;
    const imgRatio = img.width / img.height;

    let sx = 0, sy = 0, sw = img.width, sh = img.height;

    if (imgRatio > ratio) {
      const newWidth = img.height * ratio;
      sx = (img.width - newWidth) / 2;
      sw = newWidth;
    } else {
      const newHeight = img.width / ratio;
      sy = (img.height - newHeight) / 2;
      sh = newHeight;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, WIDTH, HEIGHT);

    const rectBuffer = canvas.toBuffer("image/jpeg", { quality: 0.9 });

    await writeFile(rectPath, rectBuffer);

    // ------------------------------------------------------------
    // 5) RETURN URLs
    // ------------------------------------------------------------
    return NextResponse.json({
      status: "ok",
      urls: {
        square: `/media/articles/generated/${squareFilename}`,
        rectangle: `/media/articles/generated/${rectFilename}`,
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
