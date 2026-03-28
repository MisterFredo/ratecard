from typing import Dict, List

from utils.bigquery_utils import query_bq

from core.numbers.insight_service import (
    generate_numbers_insight,
    get_numbers_by_ids,
)

from core.mcp.suggestions import build_suggestions


# ============================================================
# CONSTANTE
# ============================================================

TABLE_NUMBERS = "adex-5555.RATECARD_PROD.V_NUMBERS_ENRICHED"


# ============================================================
# 1. SÉLECTION AUTOMATIQUE (SAFE)
# ============================================================

def _get_latest_numbers_ids(entity: Dict, limit: int = 10) -> List[str]:

    label = entity.get("label")
    entity_type = entity.get("type")

    if entity_type in ["company", "topic", "solution"] and label:

        sql = f"""
        SELECT ID_NUMBER
        FROM `{TABLE_NUMBERS}`
        WHERE LOWER(entity_label) = LOWER(@label)
        ORDER BY created_at DESC
        LIMIT @limit
        """

        params = {
            "label": label,
            "limit": limit
        }

    else:

        sql = f"""
        SELECT ID_NUMBER
        FROM `{TABLE_NUMBERS}`
        ORDER BY created_at DESC
        LIMIT @limit
        """

        params = {
            "limit": limit
        }

    rows = query_bq(sql, params)

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
                "insight": insight,
                "data": numbers
            }
        }

    # ----------------------------------------------------------
    # 2. FETCH CHIFFRES (DATA)
    # ----------------------------------------------------------
    numbers = get_numbers_by_ids(ids)

    # ----------------------------------------------------------
    # 3. INSIGHT (LLM)
    # ----------------------------------------------------------
    insight = generate_numbers_insight(ids)

    # ----------------------------------------------------------
    # 4. 🔥 SUGGESTIONS DYNAMIQUES
    # ----------------------------------------------------------
    suggestions = build_suggestions(
        intent="numbers",
        entity=entity,
        items=numbers
    )

    # ----------------------------------------------------------
    # 5. RESPONSE
    # ----------------------------------------------------------
    return {
        "status": "ok",
        "intent": "numbers",
        "entity": entity,
        "answer": {
            "items": numbers,       # 🔥 data brute
            "text": insight,        # 🔥 structuration LLM
            "nb_numbers": len(ids)
        },
        "meta": {
            "suggestions": suggestions
        }
    }
