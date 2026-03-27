from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq
from utils.llm import run_llm

TABLE_RADAR = f"{BQ_PROJECT}.{BQ_DATASET}.V_RADAR_ENRICHED"


# ============================================================
# FETCH BY IDS
# ============================================================

def get_radar_by_ids(ids: List[str]) -> List[Dict]:

    if not ids:
        return []

    rows = query_bq(
        f"""
        SELECT
            ID_INSIGHT,
            TITLE,
            KEY_POINTS,
            ENTITY_TYPE,
            ENTITY_ID,
            ENTITY_LABEL,
            YEAR,
            PERIOD,
            FREQUENCY
        FROM `{TABLE_RADAR}`
        WHERE ID_INSIGHT IN UNNEST(@ids)
        """,
        {"ids": ids}
    )

    return [
        {
            "id": r.get("ID_INSIGHT"),
            "title": r.get("TITLE"),
            "key_points": r.get("KEY_POINTS") or [],
            "entity_type": r.get("ENTITY_TYPE"),
            "entity_id": r.get("ENTITY_ID"),
            "entity_label": r.get("ENTITY_LABEL") or r.get("ENTITY_ID"),

            "year": r.get("YEAR"),
            "period": r.get("PERIOD"),
            "frequency": r.get("FREQUENCY"),
        }
        for r in rows
    ]


# ============================================================
# FEED (AVEC TIMELINE)
# ============================================================

def get_radar_feed_service(
    limit: int = 100,
    query: Optional[str] = None,
    entity_type: Optional[str] = None,
    frequency: Optional[str] = None,
    year: Optional[int] = None,
    period_from: Optional[int] = None,
    period_to: Optional[int] = None,
) -> List[Dict]:

    conditions = []
    params = {"limit": limit}

    # ============================================================
    # FILTERS
    # ============================================================

    if query:
        conditions.append("LOWER(ENTITY_LABEL) LIKE LOWER(@query)")
        params["query"] = f"%{query}%"

    if entity_type:
        conditions.append("ENTITY_TYPE = @entity_type")
        params["entity_type"] = entity_type

    if frequency:
        conditions.append("FREQUENCY = @frequency")
        params["frequency"] = frequency

    if year:
        conditions.append("YEAR = @year")
        params["year"] = year

    if period_from:
        conditions.append("PERIOD >= @period_from")
        params["period_from"] = period_from

    if period_to:
        conditions.append("PERIOD <= @period_to")
        params["period_to"] = period_to

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # ============================================================
    # QUERY
    # ============================================================

    rows = query_bq(
        f"""
        SELECT
            ID_INSIGHT,
            ENTITY_TYPE,
            ENTITY_ID,
            ENTITY_LABEL,
            YEAR,
            PERIOD,
            FREQUENCY,
            TITLE,
            KEY_POINTS,
            CREATED_AT

        FROM `{TABLE_RADAR}`

        {where_clause}

        ORDER BY
            YEAR DESC,
            PERIOD DESC

        LIMIT @limit
        """,
        params
    )

    return rows


# ============================================================
# PROMPT
# ============================================================

def build_radar_prompt(radars: List[Dict]) -> str:

    blocks = []

    for r in radars:
        points = "\n".join([f"- {p}" for p in r["key_points"]])

        blocks.append(f"""
ENTITY: {r["entity_label"]}
TYPE: {r["entity_type"]}
PERIOD: {r["year"]}/{r["period"]} ({r["frequency"]})

{points}
""".strip())

    context = "\n\n-----------------\n\n".join(blocks)

    return f"""
Tu analyses plusieurs radars.

OBJECTIF :
identifier les dynamiques communes.

CONTEXTE :
{context}

TÂCHE :
1. regrouper les signaux
2. identifier les patterns
3. structurer en axes

RÈGLES :
- pas d’invention
- pas de résumé
- pas de paraphrase
- uniquement structuration

FORMAT :

STRUCTURE
- Axe :
  - point
  - point

LECTURE
- ce que ça raconte globalement
"""


# ============================================================
# MAIN
# ============================================================

def generate_radar_insight(ids: List[str]) -> str:

    radars = get_radar_by_ids(ids)

    if not radars:
        return ""

    prompt = build_radar_prompt(radars)

    return run_llm(
        prompt=prompt,
        temperature=0.2,
    ) or ""
