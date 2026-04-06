import uuid
import json
from datetime import datetime

from google.cloud import bigquery
from utils.bigquery_utils import get_bigquery_client

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

        rows.append({
            "ID_RUN": str(uuid.uuid4()),
            "ID_TEMPLATE": t["id_template"],
            "PERIOD": period,
            "STATUS": "draft",

            "DATA": json.dumps({
                "news": result.get("news", []),
                "breves": result.get("breves", []),
                "analyses": result.get("analyses", []),
                "numbers": result.get("numbers", []),
            }),

            "HEADER_CONFIG": json.dumps(result.get("header_config", {})),
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
