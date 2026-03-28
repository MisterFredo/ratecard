from typing import Dict, List

from utils.bigquery_utils import query_bq

from core.numbers.insight_service import (
    generate_numbers_insight,
    get_numbers_by_ids,
)


# ============================================================
# CONSTANTE
# ============================================================

TABLE_NUMBERS = "adex-5555.RATECARD_PROD.V_NUMBERS_ENRICHED"


# ============================================================
# 1. SÉLECTION AUTOMATIQUE
# ============================================================

def _get_latest_numbers_ids(entity: Dict, limit: int = 10) -> List[str]:

    if entity["type"] in ["company", "topic", "solution"] and entity["label"]:
        sql = f"""
        SELECT ID_NUMBER
        FROM `{TABLE_NUMBERS}`
        WHERE LOWER(entity_label) = LOWER("{entity['label']}")
        ORDER BY created_at DESC
        LIMIT {limit}
        """
    else:
        sql = f"""
        SELECT ID_NUMBER
        FROM `{TABLE_NUMBERS}`
        ORDER BY created_at DESC
        LIMIT {limit}
        """

    rows = query_bq(sql)

    return [r["ID_NUMBER"] for r in rows]


# ============================================================
# HANDLER
# ============================================================

def handle_numbers(entity: Dict) -> Dict:
    """
    Handler MCP pour :
    → voir les chiffres
    → les comprendre
    """

    # ----------------------------------------------------------
    # 1. Sélection
    # ----------------------------------------------------------
    ids = _get_latest_numbers_ids(entity)

    if not ids:
        return {
            "status": "empty",
            "intent": "numbers",
            "entity": entity,
            "answer": {
                "items": [],
                "text": ""
            }
        }

    # ----------------------------------------------------------
    # 2. FETCH CHIFFRES (BRUT)
    # ----------------------------------------------------------
    numbers = get_numbers_by_ids(ids)

    # ----------------------------------------------------------
    # 3. INSIGHT (LLM)
    # ----------------------------------------------------------
    insight = generate_numbers_insight(ids)

    # ----------------------------------------------------------
    # 4. Suggestions
    # ----------------------------------------------------------
    suggestions = [
        "Retail Media",
        "CTV",
        "Amazon",
        "Netflix"
    ]

    # ----------------------------------------------------------
    # 5. Réponse
    # ----------------------------------------------------------
    return {
        "status": "ok",
        "intent": "numbers",
        "entity": entity,
        "answer": {
            "items": numbers,       # 🔥 DATA brute
            "text": insight,        # 🔥 structuration
            "nb_numbers": len(ids)
        },
        "meta": {
            "suggestions": suggestions
        }
    }
