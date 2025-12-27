export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { BigQuery } from "@google-cloud/bigquery";
import { v4 as uuidv4 } from "uuid";

/* ---------------------------------------------------------
   BigQuery INIT
--------------------------------------------------------- */

const projectId = process.env.BQ_PROJECT!;
const dataset = process.env.BQ_DATASET!;
const table = `${projectId}.${dataset}.RATECARD_MEDIA`;

const bq = new BigQuery({
  projectId,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!),
});

async function bqInsert(rows: any[]) {
  return bq.dataset(dataset).table("RATECARD_MEDIA").insert(rows);
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function getUploadDir(category: string) {
  return path.join(process.cwd(), "uploads", "media", category);
}

// Square = 600×600
async function createSquare(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(600, 600, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

// Rectangle = 4:3 → 1200×900
async function createRectangle(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(1200, 900, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

// Original optimisé, max 2000px
async function optimizeOriginal(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/* ---------------------------------------------------------
   ROUTE UPLOAD
--------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const category = (form.get("category") as string) || "articles";

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const baseName = file.name.replace(/\s+/g, "-");
    const now = Date.now();
    const nowIso = new Date().toISOString();

    const dir = getUploadDir(category);
    await mkdir(dir, { recursive: true });

    /* ----------------------------------------------
       1) ORIGINAL OPTIMISÉ
    ---------------------------------------------- */
    const original = await optimizeOriginal(buffer);
    const originalName = `${now}_${baseName}`;
    const originalPath = path.join(dir, originalName);
    await writeFile(originalPath, original);

    /* ----------------------------------------------
       2) RECTANGLE (4:3)
    ---------------------------------------------- */
    const rect = await createRectangle(buffer);
    const rectName = `${now}_${baseName.replace(".", "_rect.")}`;
    const rectPath = path.join(dir, rectName);
    await writeFile(rectPath, rect);

    /* ----------------------------------------------
       3) SQUARE (1:1)
    ---------------------------------------------- */
    const square = await createSquare(buffer);
    const squareName = `${now}_${baseName.replace(".", "_square.")}`;
    const squarePath = path.join(dir, squareName);
    await writeFile(squarePath, square);

    /* ----------------------------------------------
       4) INSERTION BIGQUERY
    ---------------------------------------------- */

    const originalId = uuidv4();
    const rectId = uuidv4();
    const squareId = uuidv4();

    const rows = [
      {
        ID_MEDIA: originalId,
        FILEPATH: `/uploads/media/${category}/${originalName}`,
        FORMAT: "original",
        ENTITY_TYPE: null,
        ENTITY_ID: null,
        CREATED_AT: nowIso,
      },
      {
        ID_MEDIA: rectId,
        FILEPATH: `/uploads/media/${category}/${rectName}`,
        FORMAT: "rectangle",
        ENTITY_TYPE: null,
        ENTITY_ID: null,
        CREATED_AT: nowIso,
      },
      {
        ID_MEDIA: squareId,
        FILEPATH: `/uploads/media/${category}/${squareName}`,
        FORMAT: "square",
        ENTITY_TYPE: null,
        ENTITY_ID: null,
        CREATED_AT: nowIso,
      },
    ];

    await bqInsert(rows);

    /* ----------------------------------------------
       5) RESPONSE JSON — ENRICHIE (★ important)
    ---------------------------------------------- */

    return NextResponse.json({
      status: "ok",
      items: {
        original: {
          media_id: originalId,
          id: originalName,
          url: `/media/${category}/${originalName}`,
          folder: category,
          format: "original",
        },
        rectangle: {
          media_id: rectId,
          id: rectName,
          url: `/media/${category}/${rectName}`,
          folder: category,
          format: "rectangle",
        },
        square: {
          media_id: squareId,
          id: squareName,
          url: `/media/${category}/${squareName}`,
          folder: category,
          format: "square",
        },
      },
    });

  } catch (err: any) {
    console.error("❌ Sharp upload error :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
