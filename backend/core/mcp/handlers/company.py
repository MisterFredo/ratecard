from typing import Dict, List

from utils.bigquery_utils import query_bq

from core.feed.service import search_text
from core.numbers.insight_service import get_numbers_by_ids
from core.radar.insight_service import get_latest_radar


TABLE_COMPANY = "adex-5555.RATECARD_PROD.RATECARD_COMPANY"
TABLE_NUMBERS = "adex-5555.RATECARD_PROD.V_NUMBERS_ENRICHED"


# ============================================================
# COMPANY INFO
# ============================================================

def _get_company_info(label: str) -> Dict:

    sql = """
    SELECT
        ID_COMPANY,
        NAME,
        DESCRIPTION
    FROM `adex-5555.RATECARD_PROD.RATECARD_COMPANY`
    WHERE LOWER(NAME) = LOWER(@label)
    LIMIT 1
    """

    rows = query_bq(sql, {"label": label})

    return rows[0] if rows else {}


# ============================================================
# NUMBERS IDS
# ============================================================

def _get_company_numbers_ids(label: str, limit: int = 3) -> List[str]:

    sql = """
    SELECT ID_NUMBER
    FROM `adex-5555.RATECARD_PROD.V_NUMBERS_ENRICHED`
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
# HANDLER
# ============================================================

def handle_company(entity: Dict) -> Dict:

    label = entity.get("label")

    if not label:
        return {
            "status": "error",
            "intent": "company",
            "message": "Entreprise non reconnue"
        }

    # ----------------------------------------------------------
    # 1. COMPANY
    # ----------------------------------------------------------
    company = _get_company_info(label)

    # ----------------------------------------------------------
    # 🔥 FALLBACK SI NON GOUVERNÉ
    # ----------------------------------------------------------
    if not company:

        feed = search_text(query=label, limit=5) or []

        # ajout URLs
        for item in feed:
            if item.get("type") == "news":
                item["url"] = f"/news/{item.get('id')}"
            else:
                item["url"] = f"/analysis/{item.get('id')}"

        return {
            "status": "fallback",
            "intent": "company",
            "entity": entity,
            "answer": {
                "text": f"{label} n'est pas une entreprise suivie en détail.\nVoici les contenus disponibles :",
                "items": feed
            }
        }

    company_id = company.get("ID_COMPANY")

    # ----------------------------------------------------------
    # 2. FEED
    # ----------------------------------------------------------
    feed = search_text(query=label, limit=3) or []

    for item in feed:
        if item.get("type") == "news":
            item["url"] = f"/news/{item.get('id')}"
        else:
            item["url"] = f"/analysis/{item.get('id')}"

    # ----------------------------------------------------------
    # 3. NUMBERS
    # ----------------------------------------------------------
    number_ids = _get_company_numbers_ids(label, limit=3)
    numbers = get_numbers_by_ids(number_ids) if number_ids else []

    # ----------------------------------------------------------
    # 4. RADAR
    # ----------------------------------------------------------
    radar = get_latest_radar("company", company_id) if company_id else None

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
    # 6. RESPONSE
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
