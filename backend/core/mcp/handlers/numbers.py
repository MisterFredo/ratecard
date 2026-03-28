from typing import Dict, List

from utils.bigquery_utils import query_bq
from core.numbers.insight_service import generate_numbers_insight


# ============================================================
# CONSTANTE
# ============================================================

TABLE_NUMBERS = "adex-5555.RATECARD_PROD.V_NUMBERS_ENRICHED"


# ============================================================
# 1. SÉLECTION AUTOMATIQUE DES IDS
# ============================================================

def _get_latest_numbers_ids(entity: Dict, limit: int = 10) -> List[str]:
    """
    Remplace la sélection utilisateur de l'UI.
    Ici, on choisit automatiquement les derniers chiffres pertinents.
    """

    if entity["type"] in ["company", "topic", "solution"] and entity["label"]:
        sql = f"""
        SELECT ID_NUMBER
        FROM `{TABLE_NUMBERS}`
        WHERE LOWER(entity_label) = LOWER("{entity['label']}")
        ORDER BY created_at DESC
        LIMIT {limit}
        """
    else:
        # fallback : derniers chiffres globaux
        sql = f"""
        SELECT ID_NUMBER
        FROM `{TABLE_NUMBERS}`
        ORDER BY created_at DESC
        LIMIT {limit}
        """

    rows = query_bq(sql)

    return [r["ID_NUMBER"] for r in rows]


# ============================================================
# 2. HANDLER PRINCIPAL
# ============================================================

def handle_numbers(entity: Dict) -> Dict:
    """
    Handler MCP pour les chiffres.

    Flow :
    entity → sélection → pipeline → réponse
    """

    # -------------------------------
    # 1. Sélection automatique
    # -------------------------------
    ids = _get_latest_numbers_ids(entity)

    if not ids:
        return {
            "status": "empty",
            "intent": "numbers",
            "entity": entity,
            "answer": {
                "text": "Aucun chiffre disponible."
            }
        }

    # -------------------------------
    # 2. Pipeline existant (LLM)
    # -------------------------------
    insight = generate_numbers_insight(ids)

    # -------------------------------
    # 3. Suggestions (exploration)
    # -------------------------------
    suggestions = [
        "Retail Media",
        "CTV",
        "Amazon",
        "Netflix"
    ]

    # -------------------------------
    # 4. Réponse finale
    # -------------------------------
    return {
        "status": "ok",
        "intent": "numbers",
        "entity": entity,
        "answer": {
            "text": insight,
            "nb_numbers": len(ids)
        },
        "meta": {
            "suggestions": suggestions
        }
    }
