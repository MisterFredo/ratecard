from typing import List, Dict

from core.numbers.create import create_number
from utils.bigquery_utils import query_bq
from config import BQ_PROJECT, BQ_DATASET


# ============================================================
# MAP ACTOR → ENTITIES (COMPANY + SOLUTION)
# ============================================================

def _map_actor_entities(actor: str) -> Dict[str, List[str]]:

    if not actor or actor.lower() == "non précisé":
        return {
            "company_ids": [],
            "solution_ids": [],
        }

    # ============================================================
    # COMPANY ALIAS
    # ============================================================

    companies = query_bq(f"""
        SELECT DISTINCT ID_COMPANY
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_ALIAS`
        WHERE LOWER(ALIAS) = LOWER(@actor)
    """, {"actor": actor})

    # ============================================================
    # SOLUTION ALIAS
    # ============================================================

    solutions = query_bq(f"""
        SELECT DISTINCT ID_SOLUTION
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION_ALIAS`
        WHERE LOWER(ALIAS) = LOWER(@actor)
    """, {"actor": actor})

    return {
        "company_ids": [r["ID_COMPANY"] for r in companies],
        "solution_ids": [r["ID_SOLUTION"] for r in solutions],
    }


# ============================================================
# MAIN INGEST
# ============================================================

def ingest_numbers_from_content(
    chiffres: List[Dict],
    source_id: str = None,
):

    results = []

    for c in chiffres:

        # ============================================================
        # MINIMUM VALIDATION
        # ============================================================

        if c.get("value") is None:
            continue

        # ============================================================
        # ENTITY MAPPING
        # ============================================================

        entities = _map_actor_entities(c.get("actor"))

        # ============================================================
        # PAYLOAD
        # ============================================================

        payload = {
            "label": c.get("label"),
            "value": c.get("value"),
            "unit": c.get("unit"),
            "scale": c.get("scale"),
            "zone": c.get("zone"),
            "period": c.get("period"),
            "type": c.get("type"),
            "source_id": source_id,
            "company_ids": entities["company_ids"],
            "solution_ids": entities["solution_ids"],
        }

        # ============================================================
        # CREATE NUMBER
        # ============================================================

        try:
            result = create_number(payload)

        except Exception as e:
            result = {
                "id_number": None,
                "error": str(e),
                "payload": payload,
            }

        results.append(result)

    return results
