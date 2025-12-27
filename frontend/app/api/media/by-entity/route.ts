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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entity_type = searchParams.get("type");
    const entity_id = searchParams.get("id");

    if (!entity_type || !entity_id) {
      return NextResponse.json(
        { status: "error", message: "type et id obligatoires" },
        { status: 400 }
      );
    }

    const sql = `
      SELECT *
      FROM \`${tableName}\`
      WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
      ORDER BY CREATED_AT DESC
    `;

    const [rows] = await bq.query({
      query: sql,
      params: { entity_type, entity_id },
    });

    return NextResponse.json({
      status: "ok",
      media: rows,
    });
  } catch (err: any) {
    console.error("❌ by-entity error:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
