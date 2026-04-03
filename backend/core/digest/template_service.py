from datetime import datetime
from typing import Dict, Any
import uuid

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, update_bq


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

        # 🔥 FILTRES
        "TOPICS": _normalize_array(data.get("topics")),
        "COMPANIES": _normalize_array(data.get("companies")),
        "NEWS_TYPES": _normalize_array(data.get("news_types")),

        # 🔥 CONFIG EDITO (NOUVEAU)
        "EDITORIAL_ORDER": data.get("editorial_order", []),
        "HEADER_CONFIG": data.get("header_config", {}),
        "INTRO_TEXT": data.get("intro_text", ""),

        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE_TEMPLATE, row)

    return template_id


# ============================================================
# LIST
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
# GET ONE
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

        # filtres
        "topics": r.get("TOPICS") or [],
        "companies": r.get("COMPANIES") or [],
        "news_types": r.get("NEWS_TYPES") or [],

        # 🔥 éditorial
        "editorial_order": r.get("EDITORIAL_ORDER") or [],
        "header_config": r.get("HEADER_CONFIG") or {},
        "intro_text": r.get("INTRO_TEXT") or "",

        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
    }


# ============================================================
# UPDATE
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

    # 🔥 éditorial
    if "editorial_order" in data:
        fields["EDITORIAL_ORDER"] = data.get("editorial_order")

    if "header_config" in data:
        fields["HEADER_CONFIG"] = data.get("header_config")

    if "intro_text" in data:
        fields["INTRO_TEXT"] = data.get("intro_text")

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
# DELETE
# ============================================================

def delete_template(template_id: str):

    query_bq(
        f"""
        DELETE FROM `{TABLE_TEMPLATE}`
        WHERE ID_TEMPLATE = @id
        """,
        {"id": template_id},
    )

    return True
