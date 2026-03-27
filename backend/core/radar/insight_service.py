from typing import List, Dict

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
        SELECT *
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
            "entity_label": r.get("ENTITY_LABEL"),
            "year": r.get("YEAR"),
            "period": r.get("PERIOD"),
            "frequency": r.get("FREQUENCY"),
        }
        for r in rows
    ]


# ============================================================
# PROMPT
# ============================================================

def build_radar_prompt(radars: List[Dict]) -> str:

    blocks = []

    for r in radars:
        points = "\n".join([f"- {p}" for p in r["key_points"]])

        blocks.append(f"""
ENTITY: {r["entity_label"]}
PERIOD: {r["year"]}/{r["period"]}

{points}
""".strip())

    context = "\n\n-----------------\n\n".join(blocks)

    return f"""
Tu analyses plusieurs radars.

OBJECTIF :
structurer les patterns communs.

CONTEXTE :
{context}

TÂCHE :
- regrouper les signaux
- identifier les dynamiques communes
- organiser en axes

RÈGLES :
- pas d’invention
- pas de résumé
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

    return run_llm(prompt=prompt, temperature=0.2) or ""
