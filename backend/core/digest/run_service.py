import uuid
import json
from datetime import datetime

from google.cloud import bigquery
from utils.bigquery_utils import get_bigquery_client, query_bq

from core.digest.template_service import list_templates, apply_template
from config import BQ_PROJECT, BQ_DATASET

TABLE_RUN = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_DIGEST_RUN"


def generate_monthly_runs(period: str):

    templates = list_templates()
    now = datetime.utcnow().isoformat()

    rows = []

    for t in templates:

        result = apply_template(t["id_template"])

        if not result:
            continue

        # =========================================================
        # 🔥 HEADER ENRICHI (IMPORTANT)
        # =========================================================

        header_config = result.get("header_config", {})

        header_config["period"] = period  # 💥 injection dynamique

        # =========================================================
        # 🔥 STRUCTURE DATA
        # =========================================================

        data_payload = {
            "news": result.get("news", []),
            "breves": result.get("breves", []),
            "analyses": result.get("analyses", []),
            "numbers": result.get("numbers", []),
        }

        rows.append({
            "ID_RUN": str(uuid.uuid4()),
            "ID_TEMPLATE": t["id_template"],
            "PERIOD": period,
            "STATUS": "draft",

            # 🔥 DATA CLEAN
            "DATA": json.dumps(data_payload),

            # 🔥 CONFIG SNAPSHOT
            "HEADER_CONFIG": json.dumps(header_config),
            "INTRO_TEXT": result.get("intro_text", ""),
            "EDITORIAL_ORDER": json.dumps(result.get("editorial_order", [])),

            "CREATED_AT": now,
            "UPDATED_AT": now,
        })

    if not rows:
        return []

    client = get_bigquery_client()

    job = client.load_table_from_json(
        rows,
        TABLE_RUN,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )

    job.result()

    return rows

def list_runs():

    rows = query_bq(f"""
        SELECT
            ID_RUN,
            ID_TEMPLATE,
            PERIOD,
            STATUS,
            CREATED_AT
        FROM `{TABLE_RUN}`
        ORDER BY CREATED_AT DESC
    """)

    return [
        {
            "id_run": r["ID_RUN"],
            "id_template": r["ID_TEMPLATE"],
            "period": r["PERIOD"],
            "status": r["STATUS"],
            "created_at": r["CREATED_AT"],
        }
        for r in rows
    ]

def get_run(id_run: str):

    rows = query_bq(
        f"""
        SELECT *
        FROM `{TABLE_RUN}`
        WHERE ID_RUN = @id
        LIMIT 1
        """,
        {"id": id_run},
    )

    if not rows:
        return None

    r = rows[0]

    return {
        "id_run": r["ID_RUN"],
        "period": r["PERIOD"],
        "status": r["STATUS"],

        "data": json.loads(r.get("DATA") or "{}"),
        "header_config": json.loads(r.get("HEADER_CONFIG") or "{}"),
        "editorial_order": json.loads(r.get("EDITORIAL_ORDER") or "[]"),
        "intro_text": r.get("INTRO_TEXT") or "",
    }
