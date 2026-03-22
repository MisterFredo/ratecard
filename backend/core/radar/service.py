import uuid
import json

from datetime import datetime, timezone
from typing import List, Dict, Optional
from google.cloud import bigquery
from openai import OpenAI

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client

client = OpenAI()

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_RADAR"
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
        "period": r["PERIOD"],
        "frequency": r["FREQUENCY"],
        "title": r.get("TITLE"),
        "key_points": r.get("KEY_POINTS") or [],
        "status": r["STATUS"],
        "created_at": r["CREATED_AT"],
        "updated_at": r["UPDATED_AT"],
    }


# ============================================================
# CREATE
# ============================================================

def create_radar_insight(data: dict) -> str:

    insight_id = str(uuid.uuid4())
    now = _now()

    row = [{
        "ID_INSIGHT": insight_id,
        "ENTITY_TYPE": data.get("entity_type"),
        "ENTITY_ID": data.get("entity_id"),
        "YEAR": data.get("year"),
        "PERIOD": data.get("period"),
        "FREQUENCY": data.get("frequency"),
        "TITLE": data.get("title"),
        "KEY_POINTS": data.get("key_points") or [],
        "STATUS": data.get("status", "DRAFT"),
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()

    job = client.load_table_from_json(
        row,
        TABLE,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )

    job.result()

    return insight_id


# ============================================================
# GET / LIST
# ============================================================

def get_radar(entity_type, entity_id, year, period, frequency):

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND PERIOD = @period
        AND FREQUENCY = @frequency
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "period": period,
        "frequency": frequency,
    })

    return _map_row(rows[0]) if rows else None


def list_radar_insights(entity_type, entity_id):

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        ORDER BY YEAR DESC, PERIOD DESC
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
    })

    return [_map_row(r) for r in rows]


# ============================================================
# UPDATE
# ============================================================

def update_radar(entity_type, entity_id, year, period, frequency, status):

    query_bq(f"""
        UPDATE `{TABLE}`
        SET
            STATUS = @status,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND PERIOD = @period
        AND FREQUENCY = @frequency
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "period": period,
        "frequency": frequency,
        "status": status,
    })


# ============================================================
# CHECK EXISTING
# ============================================================

def radar_exists(entity_type, entity_id, year, period, frequency):

    rows = query_bq(f"""
        SELECT 1
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND PERIOD = @period
        AND FREQUENCY = @frequency
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "period": period,
        "frequency": frequency,
    })

    return len(rows) > 0


# ============================================================
# FETCH CONTENT
# ============================================================

def _get_radar_content(entity_type, entity_id, year, period, frequency):

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

    if frequency == "WEEKLY":
        date_filter_news = "EXTRACT(ISOWEEK FROM n.published_at) = @period"
        date_filter_content = "EXTRACT(ISOWEEK FROM c.published_at) = @period"

    elif frequency == "QUARTERLY":
        date_filter_news = "EXTRACT(QUARTER FROM n.published_at) = @period"
        date_filter_content = "EXTRACT(QUARTER FROM c.published_at) = @period"

    else:
        date_filter_news = "EXTRACT(MONTH FROM n.published_at) = @period"
        date_filter_content = "EXTRACT(MONTH FROM c.published_at) = @period"

    rows = query_bq(f"""
        SELECT title, excerpt
        FROM `{VIEW_NEWS}` n
        WHERE {where_news}
        AND EXTRACT(YEAR FROM n.published_at) = @year
        AND {date_filter_news}

        UNION ALL

        SELECT title, excerpt
        FROM `{VIEW_CONTENT}` c
        WHERE {where_content}
        AND EXTRACT(YEAR FROM c.published_at) = @year
        AND {date_filter_content}
    """, {
        "entity_id": entity_id,
        "year": year,
        "period": period,
    })

    return rows


# ============================================================
# PROMPT
# ============================================================

def _build_prompt(contents, frequency, year, period):

    content_str = "\n".join([
        f"- {c.get('title')} | {c.get('excerpt')}"
        for c in contents
    ])

    # ---------------------------------------------------------
    # CONTEXTE PÉRIODE (LÉGER ADAPTATIF)
    # ---------------------------------------------------------
    if frequency == "WEEKLY":
        period_label = f"Semaine {period} - {year}"
        focus = "les signaux émergents, accélérations récentes et mouvements rapides"
    elif frequency == "QUARTERLY":
        period_label = f"Trimestre {period} - {year}"
        focus = "les transformations structurelles, consolidations et dynamiques de fond"
    else:
        period_label = f"Mois {period} - {year}"
        focus = "les évolutions de marché significatives et dynamiques en cours"

    return f"""
Tu es un analyste senior spécialisé en médias, marketing et adtech.

Ton rôle n’est PAS de résumer les contenus.
Ton rôle est d’identifier les évolutions de marché à partir de plusieurs signaux.

=====================
PÉRIODE ANALYSÉE
=====================
{period_label}

Focus attendu : {focus}

=====================
CONTENUS
=====================
{content_str}

=====================
MISSION
=====================
À partir de ces contenus, identifie les 5 évolutions les plus importantes sur cette période.

=====================
RÈGLES STRICTES
=====================
- Maximum 5 points
- Chaque point = 1 phrase claire, concise et actionnable

- Interdit :
  • de résumer un article
  • de paraphraser un contenu
  • de décrire un cas isolé

- Obligatoire :
  • chaque point doit regrouper plusieurs contenus
  • chaque point doit refléter une évolution de marché
  • chaque point doit avoir un impact stratégique ou business

- Ne commence PAS un point par un nom d’entreprise
- Ne te focalise PAS sur un acteur unique

- Chaque point doit exprimer un changement clair du marché
- Évite les formulations vagues (ex : "tendance", "évolution", "croissance")
- Privilégie des formulations affirmées et structurantes

- Mets en avant :
  • évolutions de marché  
  • signaux faibles  
  • mouvements stratégiques  
  • ruptures ou accélérations  

=====================
STYLE
=====================
- Ton analytique
- Direct
- Niveau senior
- Zéro jargon inutile

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

def generate_radar(entity_type, entity_id, year, period, frequency, force=False):

    if not force and radar_exists(entity_type, entity_id, year, period, frequency):
        return {"status": "exists"}

    contents = _get_radar_content(entity_type, entity_id, year, period, frequency)

    if not contents:
        return {"status": "no_content"}

    prompt = _build_prompt(contents, frequency, year, period)

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

    insight_id = create_radar_insight({
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "period": period,
        "frequency": frequency,
        "key_points": key_points,
        "status": "GENERATED",
    })

    return {
        "status": "ok",
        "id_insight": insight_id,
        "key_points": key_points,
    }

# ============================================================
# DELETE
# ============================================================

def delete_radar_insight(insight_id: str):

    query_bq(f"""
        DELETE FROM `{TABLE}`
        WHERE ID_INSIGHT = @insight_id
    """, {
        "insight_id": insight_id
    })

def list_radar_status(entity_type, frequency, year):

    rows = query_bq(f"""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_RADAR_STATUS}`
        WHERE entity_type = @entity_type
        AND frequency = @frequency
        AND year = @year
        ORDER BY nb_contents DESC
    """, {
        "entity_type": entity_type,
        "frequency": frequency,
        "year": year,
    })

    return rows
