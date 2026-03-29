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

def _get_latest_numbers_ids(entity: Dict, limit: int = 30) -> List[str]:

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
# 2. STRUCTURATION PAR SEGMENT
# ============================================================

def _group_numbers_by_segment(numbers: List[Dict]) -> Dict:

    grouped = {}

    for n in numbers:
        segment = n.get("segment") or "Other"

        if segment not in grouped:
            grouped[segment] = []

        grouped[segment].append(n)

    return grouped


# ============================================================
# 3. TRI PAR PRIORITÉ MÉTIER
# ============================================================

def _sort_numbers(numbers: List[Dict]) -> List[Dict]:

    priority = {
        "MARKET_SHARE": 1,
        "REVENUE": 2,
        "GROWTH": 3,
        "USERS": 4,
        "VOLUME": 5,
        "PERFORMANCE": 6,
        "OTHER": 7
    }

    return sorted(
        numbers,
        key=lambda x: priority.get(x.get("category"), 99)
    )


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
                "grouped": {},
                "text": "Aucun chiffre disponible",
                "nb_numbers": 0
            },
            "meta": {
                "suggestions": []
            }
        }

    # ----------------------------------------------------------
    # 2. FETCH CHIFFRES (DATA)
    # ----------------------------------------------------------
    numbers = get_numbers_by_ids(ids)

    # ----------------------------------------------------------
    # 3. TRI
    # ----------------------------------------------------------
    numbers_sorted = _sort_numbers(numbers)

    # ----------------------------------------------------------
    # 4. STRUCTURATION
    # ----------------------------------------------------------
    numbers_grouped = _group_numbers_by_segment(numbers_sorted)

    # ----------------------------------------------------------
    # 5. INSIGHT (LLM basé sur structure)
    # ----------------------------------------------------------
    insight = generate_numbers_insight(numbers_grouped)

    # ----------------------------------------------------------
    # 6. SUGGESTIONS DYNAMIQUES
    # ----------------------------------------------------------
    suggestions = build_suggestions(
        intent="numbers",
        entity=entity,
        items=numbers_sorted
    )

    # ----------------------------------------------------------
    # 7. RESPONSE
    # ----------------------------------------------------------
    return {
        "status": "ok",
        "intent": "numbers",
        "entity": entity,
        "answer": {
            "items": numbers_sorted,        # data triée
            "grouped": numbers_grouped,     # 🔥 structuration clé
            "text": insight,                # 🔥 insight LLM
            "nb_numbers": len(numbers_sorted)
        },
        "meta": {
            "suggestions": suggestions
        }
    }
