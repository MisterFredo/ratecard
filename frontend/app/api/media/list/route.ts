export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";
import { BigQuery } from "@google-cloud/bigquery";

// ------------------------------------------
// BigQuery init
// ------------------------------------------
const projectId = process.env.BQ_PROJECT!;
const dataset = process.env.BQ_DATASET!;
const tableName = `${projectId}.${dataset}.RATECARD_MEDIA`;

const bq = new BigQuery({
  projectId,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!),
});

// ------------------------------------------
// Front categories mapping
// ------------------------------------------
const CATEGORY_MAP: Record<string, string> = {
  logos: "logos",
  "logos-cropped": "logosCropped",
  articles: "articles",
  "articles/generated": "ia",
  generics: "generics",
};

const FOLDERS = Object.keys(CATEGORY_MAP);

function getUploadRoot() {
  const root = path.join(process.cwd(), "uploads", "media");
  return root;
}

function detectType(filename: string) {
  if (filename.includes("_square")) return "square";
  if (filename.includes("_rect")) return "rect";
  return "original";
}

// ------------------------------------------
// Fetch BQ metadata for each media
// ------------------------------------------
async function getBQMetadata(filepath: string) {
  const sql = `
    SELECT ID_MEDIA, FORMAT, ENTITY_TYPE, ENTITY_ID
    FROM \`${tableName}\`
    WHERE FILEPATH = @filepath
    LIMIT 1
  `;

  const [rows] = await bq.query({
    query: sql,
    params: { filepath },
  });

  return rows[0] || null;
}

// ------------------------------------------
// Scan folder & enrich each file with BQ data
// ------------------------------------------
async function listFolder(folder: string) {
  const folderPath = path.join(getUploadRoot(), folder);

  try {
    const entries = await readdir(folderPath);
    const items = [];

    for (const entry of entries) {
      if (entry.startsWith(".")) continue;

      const full = path.join(folderPath, entry);
      const info = await stat(full);
      if (info.isDirectory()) continue;

      const publicPath = `/uploads/media/${folder}/${entry}`;

      // Metadata from BigQuery
      const bqMeta = await getBQMetadata(publicPath);

      items.push({
        // ⚙️ EXISTING FRONT FIELDS
        id: entry,
        url: `/media/${folder}/${entry}`,
        folder,
        category: CATEGORY_MAP[folder],
        type: detectType(entry),
        size: info.size,
        createdAt: info.mtimeMs,

        // 🆕 BIGQUERY METADATA
        media_id: bqMeta?.ID_MEDIA || null,
        bq_format: bqMeta?.FORMAT || null,
        entity_type: bqMeta?.ENTITY_TYPE || null,
        entity_id: bqMeta?.ENTITY_ID || null,
      });
    }

    return items;
  } catch (err) {
    console.log("⚠️ Missing folder:", folderPath);
    return [];
  }
}

// ------------------------------------------
// ROUTE GET
// ------------------------------------------
export async function GET() {
  try {
    let media: any[] = [];

    for (const folder of FOLDERS) {
      const files = await listFolder(folder);
      media = media.concat(files);
    }

    media.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ status: "ok", media });
  } catch (err: any) {
    console.error("❌ Error list:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}

