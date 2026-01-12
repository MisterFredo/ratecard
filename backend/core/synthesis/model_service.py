# backend/core/synthesis/model_service.py

import uuid
from datetime import datetime
from typing import List, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, update_bq

TABLE_SYNTHESIS_MODEL = (
    f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SYNTHESIS_MODEL"
)


# ============================================================
# LIST MODELS
# ============================================================
def list_models():
    rows = query_bq(
        f"""
        SELECT
          ID_MODEL,
          NAME,
          TOPIC_IDS,
          COMPANY_IDS,
          CREATED_AT,
          UPDATED_AT
        FROM `{TABLE_SYNTHESIS_MODEL}`
        ORDER BY NAME
        """
    )

    return [
        {
            "id_model": r["ID_MODEL"],
            "name": r["NAME"],
            "topic_ids": r.get("TOPIC_IDS") or [],
            "company_ids": r.get("COMPANY_IDS") or [],
            "created_at": r.get("CREATED_AT"),
            "updated_at": r.get("UPDATED_AT"),
        }
        for r in rows
    ]


# ============================================================
# CREATE MODEL — ARRAY SAFE
# ============================================================
def create_model(
    name: str,
    topic_ids: Optional[List[str]] = None,
    company_ids: Optional[List[str]] = None,
):
    if not name or not name.strip():
        raise ValueError("Le nom du modèle est obligatoire")

    now = datetime.utcnow()
    id_model = str(uuid.uuid4())

    row = [
        {
            "ID_MODEL": id_model,
            "NAME": name.strip(),
            "TOPIC_IDS": topic_ids or [],
            "COMPANY_IDS": company_ids or [],
            "CREATED_AT": now,
            "UPDATED_AT": now,
        }
    ]

    client = get_bigquery_client()

    client.load_table_from_json(
        row,
        TABLE_SYNTHESIS_MODEL,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    return id_model

# ============================================================
# UPDATE MODEL — NAME ONLY (V1 SAFE)
# ============================================================
def update_model(
    id_model: str,
    name: Optional[str] = None,
    topic_ids: Optional[List[str]] = None,
    company_ids: Optional[List[str]] = None,
):
    fields = {}

    if name is not None:
        fields["NAME"] = name.strip()

    if not fields:
        return False

    fields["UPDATED_AT"] = datetime.utcnow()

    update_bq(
        table=TABLE_SYNTHESIS_MODEL,
        fields=fields,
        where={"ID_MODEL": id_model},
    )

    return True
