from typing import Dict, List

from utils.bigquery_utils import query_bq

from core.feed.service import search_text
from core.numbers.insight_service import get_numbers_by_ids
from core.radar.insight_service import get_latest_radar


# ============================================================
# CONSTANTES
# ============================================================

TABLE_COMPANY = "adex-5555.RATECARD_PROD.RATECARD_COMPANY"
TABLE_NUMBERS = "adex-5555.RATECARD_PROD.V_NUMBERS_ENRICHED"


# ============================================================
# 1. COMPANY INFO
# ============================================================

def _get_company_info(label: str) -> Dict:

    sql = f"""
    SELECT
        ID_COMPANY,
        NAME,
        DESCRIPTION
    FROM `{TABLE_COMPANY}`
    WHERE LOWER(NAME) = LOWER(@label)
    LIMIT 1
    """

    rows = query_bq(sql, {"label": label})

    return rows[0] if rows else {}


# ============================================================
# 2. NUMBERS IDS
# ============================================================

def _get_company_numbers_ids(label: str, limit: int = 3) -> List[str]:

    sql = f"""
    SELECT ID_NUMBER
    FROM `{TABLE_NUMBERS}`
    WHERE LOWER(entity_label) = LOWER(@label)
    ORDER BY created_at DESC
    LIMIT @limit
    """

    rows = query_bq(sql, {
        "label": label,
        "limit": limit
    })

    return [r["ID_NUMBER"] for r in rows]


# ============================================================
# 3. HANDLER
# ============================================================

def handle_company(entity: Dict) -> Dict:
    """
    Handler MCP pour :
    → obtenir un snapshot complet d’une entreprise
    """

    label = entity.get("label")

    if not label:
        return {
            "status": "error",
            "intent": "company",
            "message": "Entreprise non reconnue"
        }

    # ----------------------------------------------------------
    # 1. INFO
    # ----------------------------------------------------------
    company = _get_company_info(label)

    if not company:
        return {
            "status": "empty",
            "intent": "company",
            "entity": entity,
            "answer": {
                "text": "Aucune information disponible pour cette entreprise."
            }
        }

    company_id = company.get("ID_COMPANY")

    # ----------------------------------------------------------
    # 2. FEED (3 contenus)
    # ----------------------------------------------------------
    feed = search_text(query=label, limit=3) or []

    # 👉 ajout URL (important démo MCP)
    for item in feed:
        if item.get("type") == "news":
            item["url"] = f"/news/{item.get('id')}"
        else:
            item["url"] = f"/analysis/{item.get('id')}"

    # ----------------------------------------------------------
    # 3. NUMBERS (3)
    # ----------------------------------------------------------
    number_ids = _get_company_numbers_ids(label, limit=3)
    numbers = get_numbers_by_ids(number_ids) if number_ids else []

    # ----------------------------------------------------------
    # 4. RADAR (latest)
    # ----------------------------------------------------------
    radar = None

    if company_id:
        radar = get_latest_radar("company", company_id)

    # ----------------------------------------------------------
    # 5. Suggestions
    # ----------------------------------------------------------
    suggestions = [
        "Amazon",
        "Google",
        "Criteo",
        "Netflix"
    ]

    # ----------------------------------------------------------
    # 6. Réponse finale
    # ----------------------------------------------------------
    return {
        "status": "ok",
        "intent": "company",
        "entity": entity,
        "answer": {
            "name": company.get("NAME"),
            "description": company.get("DESCRIPTION"),

            "latest_contents": feed,
            "numbers": numbers,
            "radar": radar,
        },
        "meta": {
            "suggestions": suggestions
        }
    }
