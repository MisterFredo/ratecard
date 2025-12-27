// 👇 Important : force l'utilisation du runtime Node
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { BigQuery } from "@google-cloud/bigquery";
import { v4 as uuidv4 } from "uuid";

/* ---------------------------------------------------------
   BigQuery init
--------------------------------------------------------- */
const projectId = process.env.BQ_PROJECT!;
const dataset = process.env.BQ_DATASET!;
const tableName = `${projectId}.${dataset}.RATECARD_MEDIA`;

const bq = new BigQuery({
  projectId,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!),
});

async function bqInsert(rows: any[]) {
  return bq.dataset(dataset).table("RATECARD_MEDIA").insert(rows);
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

    // 4) Save square + rectangle dans uploads/media/articles/generated
    const now = Date.now();
    const nowIso = new Date().toISOString();

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

    // 5) BQ indexing
    const rows = [
      {
        ID_MEDIA: uuidv4(),
        FILEPATH: `/uploads/media/${category}/${squareName}`,
        FORMAT: "square",
        ENTITY_TYPE: null,
        ENTITY_ID: null,
        CREATED_AT: nowIso,
      },
      {
        ID_MEDIA: uuidv4(),
        FILEPATH: `/uploads/media/${category}/${rectName}`,
        FORMAT: "rectangle",
        ENTITY_TYPE: null,
        ENTITY_ID: null,
        CREATED_AT: nowIso,
      },
    ];

    await bqInsert(rows);

    // 6) Retour pour le front
    return NextResponse.json({
      status: "ok",
      urls: {
        square: `/media/${category}/${squareName}`,
        rectangle: `/media/${category}/${rectName}`,
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

