export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

const projectId = process.env.BQ_PROJECT!;
const dataset = process.env.BQ_DATASET!;
const tableName = `${projectId}.${dataset}.RATECARD_MEDIA`;

const bq = new BigQuery({
  projectId,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!),
});

export async function POST(req: Request) {
  try {
    const { media_id, entity_type, entity_id } = await req.json();

    if (!media_id || !entity_type || !entity_id) {
      return NextResponse.json(
        { status: "error", message: "Paramètres invalides." },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE \`${tableName}\`
      SET ENTITY_TYPE = @entity_type,
          ENTITY_ID = @entity_id
      WHERE ID_MEDIA = @media_id
    `;

    await bq.query({
      query: sql,
      params: { media_id, entity_type, entity_id },
    });

    return NextResponse.json({
      status: "ok",
      assigned: { media_id, entity_type, entity_id },
    });
  } catch (err: any) {
    console.error("❌ Assign error:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
