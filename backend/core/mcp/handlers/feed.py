from typing import Dict, List

from core.feed.service import search_text
from utils.bigquery_utils import query_bq


TABLE_NEWS = "adex-5555.RATECARD_PROD.RATECARD_NEWS"
TABLE_CONTENT = "adex-5555.RATECARD_PROD.RATECARD_CONTENT"


# ============================================================
# FETCH LATEST (SANS SEARCH)
# ============================================================

def _get_latest_items(limit: int = 10) -> List[Dict]:
    """
    Derniers contenus globaux (arrivée utilisateur)
    """

    sql = f"""
    SELECT
        n.ID_NEWS as id,
        'news' as type,
        n.TITLE,
        n.EXCERPT,
        n.PUBLISHED_AT
    FROM `{TABLE_NEWS}` n
    WHERE n.STATUS = 'PUBLISHED'

    UNION ALL

    SELECT
        c.ID_CONTENT as id,
        'analysis' as type,
        c.TITLE,
        c.EXCERPT,
        c.PUBLISHED_AT
    FROM `{TABLE_CONTENT}` c
    WHERE c.STATUS = 'PUBLISHED'
      AND c.IS_ACTIVE = TRUE

    ORDER BY PUBLISHED_AT DESC
    LIMIT {limit}
    """

    return query_bq(sql)


# ============================================================
# HANDLER
# ============================================================

def handle_feed(entity: Dict, user_query: str) -> Dict:
    """
    Handler MCP pour :
    → découvrir les contenus (quoi de neuf)
    """

    # ----------------------------------------------------------
    # 1. Déterminer le mode
    # ----------------------------------------------------------

    entity_label = entity.get("label")
    query = user_query.strip().lower() if user_query else ""

    # 👉 cas 1 : exploration globale
    if not entity_label and (
        not query or "quoi de neuf" in query or "actualité" in query
    ):
        rows = _get_latest_items(limit=10)

    # 👉 cas 2 : recherche ciblée
    else:
        search_query = entity_label or user_query
        rows = search_text(query=search_query, limit=10)

    # ----------------------------------------------------------
    # 2. Gestion vide
    # ----------------------------------------------------------

    if not rows:
        return {
            "status": "empty",
            "intent": "feed",
            "entity": entity,
            "answer": {
                "items": []
            }
        }

    # ----------------------------------------------------------
    # 3. Suggestions (exploration)
    # ----------------------------------------------------------

    suggestions = [
        "Retail Media",
        "CTV",
        "Amazon",
        "Netflix"
    ]

    # ----------------------------------------------------------
    # 4. Réponse
    # ----------------------------------------------------------

    return {
        "status": "ok",
        "intent": "feed",
        "entity": entity,
        "answer": {
            "items": rows
        },
        "meta": {
            "suggestions": suggestions
        }
    }
