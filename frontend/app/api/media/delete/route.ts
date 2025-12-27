import { NextResponse } from "next/server";
import { unlink, stat } from "fs/promises";
import path from "path";
import { BigQuery } from "@google-cloud/bigquery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Important pour accès FS

/* ---------------------------------------------------------
   BigQuery INIT
--------------------------------------------------------- */

const projectId = process.env.BQ_PROJECT!;
const dataset = process.env.BQ_DATASET!;
const tableName = `${projectId}.${dataset}.RATECARD_MEDIA`;

const bq = new BigQuery({
  projectId,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!),
});

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

// Exemple input: /media/articles/xxx_rect.jpg
function resolvePhysicalPath(url: string) {
  const relative = url.replace("/media/", ""); 
  return path.join(process.cwd(), "uploads", "media", relative);
}

// Convert public URL → filepath stored in BQ
function makeBQFilepath(url: string) {
  // /media/articles/xxx.jpg → /uploads/media/articles/xxx.jpg
  return url.replace("/media/", "/uploads/media/");
}

/* ---------------------------------------------------------
   ROUTE DELETE
--------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { status: "error", message: "URL manquante" },
        { status: 400 }
      );
    }

    if (!url.startsWith("/media/")) {
      return NextResponse.json(
        { status: "error", message: "Chemin invalide" },
        { status: 400 }
      );
    }

    /* ----------------------------------------------
       1) Suppression du fichier physique
    ---------------------------------------------- */
    const filePath = resolvePhysicalPath(url);
    console.log("🗑️ SUPPRESSION FICHIER :", filePath);

    const info = await stat(filePath).catch(() => null);

    if (!info) {
      return NextResponse.json(
        { status: "error", message: "Fichier introuvable" },
        { status: 404 }
      );
    }

    if (info.isDirectory()) {
      return NextResponse.json(
        { status: "error", message: "Impossible de supprimer un dossier" },
        { status: 400 }
      );
    }

    await unlink(filePath);

    /* ----------------------------------------------
       2) Suppression BigQuery
          (si le fichier a été indexé dans RATECARD_MEDIA)
    ---------------------------------------------- */

    const bqFilepath = makeBQFilepath(url);

    const deleteSQL = `
      DELETE FROM \`${tableName}\`
      WHERE FILEPATH = @filepath
    `;

    await bq.query({
      query: deleteSQL,
      params: { filepath: bqFilepath },
    });

    console.log("🗂️ BQ metadata supprimée pour :", bqFilepath);

    /* ----------------------------------------------
       3) Réponse JSON
    ---------------------------------------------- */

    return NextResponse.json({
      status: "ok",
      deleted: url,
    });

  } catch (err: any) {
    console.error("❌ Erreur suppression fichier :", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}

