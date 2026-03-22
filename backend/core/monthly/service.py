import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional

from openai import OpenAI

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client

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
        "id_insight": r["ID_INSIGHT"],
        "entity_type": r["ENTITY_TYPE"],
        "entity_id": r["ENTITY_ID"],
        "year": r["YEAR"],
        "month": r["MONTH"],
        "title": r.get("TITLE"),
        "key_points": r.get("KEY_POINTS") or [],
        "status": r["STATUS"],
        "created_at": r["CREATED_AT"],
        "updated_at": r["UPDATED_AT"],
    }


# ============================================================
# CREATE
# ============================================================

def create_monthly_insight(data: dict) -> str:

    insight_id = str(uuid.uuid4())

    row = [{
        "ID_INSIGHT": insight_id,
        "ENTITY_TYPE": data.get("entity_type"),
        "ENTITY_ID": data.get("entity_id"),
        "YEAR": data.get("year"),
        "MONTH": data.get("month"),
        "TITLE": data.get("title"),
        "KEY_POINTS": data.get("key_points", []),
        "STATUS": data.get("status", "DRAFT"),
        "CREATED_AT": _now(),
        "UPDATED_AT": _now(),
    }]

    insert_bq(TABLE, row)

    return insight_id


# ============================================================
# GET / LIST
# ============================================================

def get_monthly_insight(entity_type, entity_id, year, month):

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


def list_monthly_insights(entity_type, entity_id):

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

def update_monthly_insight(insight_id: str, data: dict):

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
            {"name": "insight_id", "parameterType": {"type": "STRING"}, "parameterValue": {"value": insight_id}},
            {"name": "title", "parameterType": {"type": "STRING"}, "parameterValue": {"value": data.get("title")}},
            {
                "name": "key_points",
                "parameterType": {"type": "ARRAY", "arrayType": {"type": "STRING"}},
                "parameterValue": {
                    "arrayValues": [{"value": v} for v in data.get("key_points", [])]
                },
            },
            {"name": "status", "parameterType": {"type": "STRING"}, "parameterValue": {"value": data.get("status", "DRAFT")}},
        ]
    }

    client.query(query, job_config=job_config).result()


# ============================================================
# CHECK EXISTING
# ============================================================

def monthly_insight_exists(entity_type, entity_id, year, month):

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
# FETCH CONTENT
# ============================================================

def _get_monthly_content(entity_type, entity_id, year, month):

    where_news = "FALSE"
    where_content = "FALSE"

    if entity_type == "topic":
        where_news = "EXISTS (SELECT 1 FROM UNNEST(n.topics) t WHERE t.id_topic = @entity_id)"
        where_content = "EXISTS (SELECT 1 FROM UNNEST(c.topics) t WHERE t.id_topic = @entity_id)"

    elif entity_type == "company":
        where_news = "n.id_company = @entity_id"
        where_content = "EXISTS (SELECT 1 FROM UNNEST(c.companies) comp WHERE comp.id_company = @entity_id)"

    elif entity_type == "solution":
        where_content = "EXISTS (SELECT 1 FROM UNNEST(c.solutions) s WHERE s.id_solution = @entity_id)"

    rows = query_bq(f"""
        SELECT title, excerpt
        FROM `{VIEW_NEWS}` n
        WHERE {where_news}
        AND EXTRACT(YEAR FROM n.published_at) = @year
        AND EXTRACT(MONTH FROM n.published_at) = @month

        UNION ALL

        SELECT title, excerpt
        FROM `{VIEW_CONTENT}` c
        WHERE {where_content}
        AND EXTRACT(YEAR FROM c.published_at) = @year
        AND EXTRACT(MONTH FROM c.published_at) = @month
    """, {
        "entity_id": entity_id,
        "year": year,
        "month": month,
    })

    return rows


# ============================================================
# PROMPT
# ============================================================

def _build_prompt(contents):

    content_str = "\n".join([
        f"- {c.get('title')} | {c.get('excerpt')}"
        for c in contents
    ])

    return f"""
Tu es un analyste senior spécialisé en médias, marketing et adtech.

Ton rôle n’est PAS de résumer les contenus.
Ton rôle est d’identifier les signaux clés, les évolutions importantes et les tendances structurantes.

=====================
CONTENUS DU MOIS
=====================
{content_str}

=====================
MISSION
=====================
À partir de ces contenus, identifie les 5 éléments les plus importants à retenir ce mois-ci.

=====================
RÈGLES STRICTES
=====================
- Maximum 5 points
- Chaque point = 1 phrase claire, concise et actionnable
- Pas de résumé d’article
- Pas de paraphrase
- Pas de généralités vagues
- Mets en avant :
  • les évolutions de marché  
  • les signaux faibles  
  • les mouvements stratégiques  
  • les ruptures ou accélérations  

- Si plusieurs contenus parlent du même sujet → synthétise en un seul insight
- Priorise ce qui a un impact business ou stratégique

=====================
STYLE
=====================
- Ton analytique
- Direct
- Sans jargon inutile
- Niveau senior (pas pédagogique)

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

def generate_monthly_insight(entity_type, entity_id, year, month, force=False):

    if not force and monthly_insight_exists(entity_type, entity_id, year, month):
        return {"status": "exists"}

    contents = _get_monthly_content(entity_type, entity_id, year, month)

    if not contents:
        return {"status": "no_content"}

    prompt = _build_prompt(contents)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    raw = response.choices[0].message.content

    try:
        key_points = json.loads(raw).get("key_points", [])
    except Exception:
        return {"status": "error", "raw": raw}

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
