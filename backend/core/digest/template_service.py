import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    insert_bq,
    update_bq,
    get_bigquery_client,
)

# ============================================================
# TABLE
# ============================================================

TABLE_TEMPLATE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_DIGEST_TEMPLATE"


# ============================================================
# UTILS
# ============================================================

def _normalize_array(value):
    if not value:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if isinstance(v, str) and v.strip()]
    return []


# ============================================================
# CREATE TEMPLATE
# ============================================================

def create_template(data: Dict[str, Any]) -> str:

    if not data.get("name"):
        raise ValueError("NAME obligatoire")

    template_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_TEMPLATE": template_id,
        "NAME": data["name"],
        "TOPICS": _normalize_array(data.get("topics")),
        "COMPANIES": _normalize_array(data.get("companies")),
        "NEWS_TYPES": _normalize_array(data.get("news_types")),
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE_TEMPLATE, row)

    return template_id


# ============================================================
# LIST TEMPLATES
# ============================================================

def list_templates():

    rows = query_bq(
        f"""
        SELECT
            ID_TEMPLATE,
            NAME,
            TOPICS,
            COMPANIES,
            NEWS_TYPES,
            CREATED_AT,
            UPDATED_AT
        FROM `{TABLE_TEMPLATE}`
        ORDER BY UPDATED_AT DESC
        """
    )

    return [
        {
            "id_template": r["ID_TEMPLATE"],
            "name": r["NAME"],
            "topics": r.get("TOPICS") or [],
            "companies": r.get("COMPANIES") or [],
            "news_types": r.get("NEWS_TYPES") or [],
            "created_at": r.get("CREATED_AT"),
            "updated_at": r.get("UPDATED_AT"),
        }
        for r in rows
    ]


# ============================================================
# GET ONE TEMPLATE
# ============================================================

def get_template(template_id: str):

    rows = query_bq(
        f"""
        SELECT *
        FROM `{TABLE_TEMPLATE}`
        WHERE ID_TEMPLATE = @id
        LIMIT 1
        """,
        {"id": template_id},
    )

    if not rows:
        return None

    r = rows[0]

    return {
        "id_template": r["ID_TEMPLATE"],
        "name": r["NAME"],
        "topics": r.get("TOPICS") or [],
        "companies": r.get("COMPANIES") or [],
        "news_types": r.get("NEWS_TYPES") or [],
        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
    }


# ============================================================
# UPDATE TEMPLATE
# ============================================================

def update_template(template_id: str, data: Dict[str, Any]):

    fields = {}

    if "name" in data:
        fields["NAME"] = data["name"]

    if "topics" in data:
        fields["TOPICS"] = _normalize_array(data.get("topics"))

    if "companies" in data:
        fields["COMPANIES"] = _normalize_array(data.get("companies"))

    if "news_types" in data:
        fields["NEWS_TYPES"] = _normalize_array(data.get("news_types"))

    if not fields:
        return False

    fields["UPDATED_AT"] = datetime.utcnow()

    update_bq(
        table=TABLE_TEMPLATE,
        fields=fields,
        where={"ID_TEMPLATE": template_id},
    )

    return True


# ============================================================
# DELETE TEMPLATE
# ============================================================

def delete_template(template_id: str):

    client = get_bigquery_client()

    client.query(
        f"""
        DELETE FROM `{TABLE_TEMPLATE}`
        WHERE ID_TEMPLATE = @id
        """,
        job_config=None,
    ).result()

    return True
