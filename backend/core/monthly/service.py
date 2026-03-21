import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from openai import OpenAI
from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client

from api.monthly.models import (
    MonthlyInsightInput,
)

client = OpenAI()

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MONTHLY"
VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"


# ============================================================
# HELPERS
# ============================================================

def _now():
    return datetime.now(timezone.utc).isoformat()


def _map_row(r: Dict) -> Dict:
    return {
        "id_insight": r.get("ID_INSIGHT"),
        "entity_type": r.get("ENTITY_TYPE"),
        "entity_id": r.get("ENTITY_ID"),
        "year": r.get("YEAR"),
        "month": r.get("MONTH"),
        "title": r.get("TITLE"),
        "key_points": r.get("KEY_POINTS") or [],
        "status": r.get("STATUS"),
        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
    }


# ============================================================
# CREATE
# ============================================================

def create_monthly_insight(data: MonthlyInsightInput) -> str:

    insight_id = str(uuid.uuid4())
    now = _now()

    row = [{
        "ID_INSIGHT": insight_id,
        "ENTITY_TYPE": data.entity_type,
        "ENTITY_ID": data.entity_id,
        "YEAR": data.year,
        "MONTH": data.month,
        "TITLE": data.title,
        "KEY_POINTS": data.key_points or [],
        "STATUS": data.status or "DRAFT",
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE, row)

    return insight_id


# ============================================================
# GET ONE
# ============================================================

def get_monthly_insight(
    entity_type: str,
    entity_id: str,
    year: int,
    month: int,
) -> Optional[Dict]:

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND MONTH = @month
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "month": month,
    })

    return _map_row(rows[0]) if rows else None


# ============================================================
# LIST (TIMELINE)
# ============================================================

def list_monthly_insights(
    entity_type: str,
    entity_id: str,
) -> List[Dict]:

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        ORDER BY YEAR DESC, MONTH DESC
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
    })

    return [_map_row(r) for r in rows]


# ============================================================
# UPDATE
# ============================================================

def update_monthly_insight(
    insight_id: str,
    data: Dict
):

    client = get_bigquery_client()

    query = f"""
        UPDATE `{TABLE}`
        SET
            TITLE = @title,
            KEY_POINTS = @key_points,
            STATUS = @status,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID_INSIGHT = @insight_id
    """

    job_config = {
        "query_parameters": [
            {
                "name": "insight_id",
                "parameterType": {"type": "STRING"},
                "parameterValue": {"value": insight_id},
            },
            {
                "name": "title",
                "parameterType": {"type": "STRING"},
                "parameterValue": {"value": data.get("title")},
            },
            {
                "name": "key_points",
                "parameterType": {
                    "type": "ARRAY",
                    "arrayType": {"type": "STRING"},
                },
                "parameterValue": {
                    "arrayValues": [
                        {"value": v} for v in data.get("key_points", [])
                    ]
                },
            },
            {
                "name": "status",
                "parameterType": {"type": "STRING"},
                "parameterValue": {"value": data.get("status", "DRAFT")},
            },
        ]
    }

    client.query(query, job_config=job_config).result()


# ============================================================
# DELETE
# ============================================================

def delete_monthly_insight(insight_id: str):

    query_bq(f"""
        DELETE FROM `{TABLE}`
        WHERE ID_INSIGHT = @insight_id
    """, {
        "insight_id": insight_id
    })


# ============================================================
# CHECK EXISTING (clé pour génération)
# ============================================================

def monthly_insight_exists(
    entity_type: str,
    entity_id: str,
    year: int,
    month: int,
) -> bool:

    rows = query_bq(f"""
        SELECT 1
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND MONTH = @month
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "month": month,
    })

    return len(rows) > 0


# ============================================================
# FETCH CONTENT FOR MONTH
# ============================================================

def _get_monthly_content(
    entity_type: str,
    entity_id: str,
    year: int,
    month: int,
    limit: int = 30,
):

    where_news = "FALSE"
    where_content = "FALSE"

    if entity_type == "topic":
        where_news = """
            EXISTS (
                SELECT 1 FROM UNNEST(n.topics) t
                WHERE t.id_topic = @entity_id
            )
        """
        where_content = """
            EXISTS (
                SELECT 1 FROM UNNEST(c.topics) t
                WHERE t.id_topic = @entity_id
            )
        """

    elif entity_type == "company":
        where_news = "n.id_company = @entity_id"
        where_content = """
            EXISTS (
                SELECT 1 FROM UNNEST(c.companies) comp
                WHERE comp.id_company = @entity_id
            )
        """

    elif entity_type == "solution":
        where_content = """
            EXISTS (
                SELECT 1 FROM UNNEST(c.solutions) s
                WHERE s.id_solution = @entity_id
            )
        """

    sql = f"""
    SELECT * FROM (

        -- NEWS
        SELECT
            n.title,
            n.excerpt,
            n.topics,
            n.company_name
        FROM `{VIEW_NEWS}` n
        WHERE {where_news}
        AND EXTRACT(YEAR FROM n.published_at) = @year
        AND EXTRACT(MONTH FROM n.published_at) = @month

        UNION ALL

        -- CONTENT
        SELECT
            c.title,
            c.excerpt,
            c.topics,
            NULL as company_name
        FROM`{VIEW_CONTENT}` c
        WHERE {where_content}
        AND EXTRACT(YEAR FROM c.published_at) = @year
        AND EXTRACT(MONTH FROM c.published_at) = @month

    )
    LIMIT @limit
    """

    rows = query_bq(sql, {
        "entity_id": entity_id,
        "year": year,
        "month": month,
        "limit": limit,
    })

    return rows


# ============================================================
# PREVIOUS INSIGHT
# ============================================================

def _get_previous_insight(entity_type, entity_id, year, month):

    rows = query_bq(f"""
        SELECT KEY_POINTS
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND (
            (YEAR = @year AND MONTH < @month)
            OR YEAR < @year
        )
        ORDER BY YEAR DESC, MONTH DESC
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "month": month,
    })

    return rows[0]["KEY_POINTS"] if rows else []


# ============================================================
# BUILD PROMPT
# ============================================================

def _build_prompt(contents, previous_points):

    content_str = "\n".join([
        f"- {c.get('title')} | {c.get('excerpt')}"
        for c in contents
    ])

    previous_str = "\n".join(previous_points) if previous_points else "Aucun"

    return f"""
Tu es un analyste senior en médias et marketing.

Ton rôle n’est PAS de résumer des articles.
Ton rôle est d’identifier les évolutions importantes, les signaux faibles et les tendances structurantes.

=====================
CONTENUS DU MOIS
=====================
{content_str}

=====================
POINTS CLÉS DU MOIS PRÉCÉDENT
=====================
{previous_str}

=====================
MISSION
=====================
Identifie les 5 éléments les plus importants à retenir ce mois-ci.

=====================
RÈGLES STRICTES
=====================
- Maximum 5 points
- Chaque point = une phrase claire et directe
- Pas de résumé d’article
- Pas de généralités vagues
- Mets en avant les évolutions, ruptures ou accélérations
- Si pertinent, souligne ce qui change par rapport au mois précédent
- Style analytique, professionnel, concis

=====================
FORMAT DE SORTIE (JSON STRICT)
=====================
{{
  "key_points": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ]
}}
"""


# ============================================================
# GENERATE
# ============================================================

def generate_monthly_insight(
    entity_type: str,
    entity_id: str,
    year: int,
    month: int,
    force: bool = False,
):

    # 🔥 1. CHECK EXISTING
    if not force and monthly_insight_exists(entity_type, entity_id, year, month):
        return {"status": "exists"}

    # 🔥 2. FETCH CONTENT
    contents = _get_monthly_content(entity_type, entity_id, year, month)

    if not contents:
        return {"status": "no_content"}

    # 🔥 3. PREVIOUS
    previous = _get_previous_insight(entity_type, entity_id, year, month)

    # 🔥 4. PROMPT
    prompt = _build_prompt(contents, previous)

    # 🔥 5. LLM CALL
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    raw = response.choices[0].message.content

    try:
        parsed = json.loads(raw)
        key_points = parsed.get("key_points", [])
    except Exception:
        print("❌ JSON parsing failed:", raw)
        return {"status": "error", "raw": raw}

    # 🔥 6. SAVE
    insight_id = create_monthly_insight({
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "month": month,
        "key_points": key_points,
        "status": "GENERATED",
    })

    return {
        "status": "ok",
        "id_insight": insight_id,
        "key_points": key_points,
    }
