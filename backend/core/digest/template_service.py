from datetime import datetime, timedelta
from typing import Dict, Any
import uuid
import json

from config import BQ_PROJECT, BQ_DATASET
from core.digest.service import search_digest
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

        # 🔥 CONFIG EDITO (STRING SAFE)
        "EDITORIAL_ORDER": json.dumps(data.get("editorial_order", [])),
        "HEADER_CONFIG": json.dumps(data.get("header_config", {})),
        "INTRO_TEXT": data.get("intro_text", ""),

        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE_TEMPLATE, row)

    return template_id

# ============================================================
# APPLY TEMPLATE
# ============================================================

def apply_template(template_id: str):

    tpl = get_template(template_id)

    if not tpl:
        return None

    header_config = tpl.get("header_config") or {}
    blocks = header_config.get("blocks", {})

    # =========================================================
    # PERIOD RESOLUTION
    # =========================================================

    def resolve_period(block):

        period = block.get("period")

        if period == "last_month":
            return get_previous_month_range()

        return None, None

    # =========================================================
    # NEWS
    # =========================================================

    news_block = blocks.get("news", {})
    news_from, news_to = resolve_period(news_block)

    news = search_digest(
        topics=news_block.get("topics"),
        companies=news_block.get("companies"),
        news_types=None,
        limit=news_block.get("limit", 10),
        period="total",
        date_from=news_from,
        date_to=news_to,
    ).get("news", [])

    # =========================================================
    # BRÈVES
    # =========================================================

    breves_block = blocks.get("breves", {})
    breves_from, breves_to = resolve_period(breves_block)

    breves = search_digest(
        topics=breves_block.get("topics"),
        companies=breves_block.get("companies"),
        news_types=None,
        limit=breves_block.get("limit", 10),
        period="total",
        date_from=breves_from,
        date_to=breves_to,
    ).get("breves", [])

    # =========================================================
    # ANALYSES
    # =========================================================

    analyses_block = blocks.get("analyses", {})
    analyses_from, analyses_to = resolve_period(analyses_block)

    analyses = search_digest(
        topics=analyses_block.get("topics"),
        companies=analyses_block.get("companies"),
        news_types=None,
        limit=analyses_block.get("limit", 10),
        period="total",
        date_from=analyses_from,
        date_to=analyses_to,
    ).get("analyses", [])

    # =========================================================
    # FINAL STRUCTURE
    # =========================================================

    return {
        "news": news,
        "breves": breves,
        "analyses": analyses,
        "numbers": [],  # pas concerné

        "editorial_order": tpl.get("editorial_order") or [],
        "header_config": header_config,
        "intro_text": tpl.get("intro_text") or "",
    }


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

def get_previous_month_range():
    """
    Retourne le mois calendaire précédent complet.
    Exemple :
    - 5 avril → 1er mars → 31 mars
    """
    today = datetime.utcnow()

    first_day_current_month = today.replace(day=1)

    last_day_previous_month = first_day_current_month - timedelta(days=1)

    first_day_previous_month = last_day_previous_month.replace(day=1)

    return first_day_previous_month, last_day_previous_month

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

        # 🔥 filtres
        "topics": r.get("TOPICS") or [],
        "companies": r.get("COMPANIES") or [],
        "news_types": r.get("NEWS_TYPES") or [],

        # 🔥 éditorial (parse JSON STRING)
        "editorial_order": json.loads(r.get("EDITORIAL_ORDER") or "[]"),
        "header_config": json.loads(r.get("HEADER_CONFIG") or "{}"),
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

    # 🔥 éditorial (STRING SAFE)
    if "editorial_order" in data:
        fields["EDITORIAL_ORDER"] = json.dumps(data.get("editorial_order"))

    if "header_config" in data:
        fields["HEADER_CONFIG"] = json.dumps(data.get("header_config"))

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
