from typing import Dict, List

from core.feed.service import search_text
from utils.bigquery_utils import query_bq


TABLE_NEWS = "adex-5555.RATECARD_PROD.RATECARD_NEWS"
TABLE_CONTENT = "adex-5555.RATECARD_PROD.RATECARD_CONTENT"


# ============================================================
# FETCH LATEST (AVEC URL)
# ============================================================

def _get_latest_items(limit: int = 10) -> List[Dict]:

    sql = f"""
    SELECT
        n.ID_NEWS as id,
        'news' as type,
        n.TITLE,
        n.EXCERPT,
        n.PUBLISHED_AT,
        n.SOURCE_URL as url
    FROM `{TABLE_NEWS}` n
    WHERE n.STATUS = 'PUBLISHED'

    UNION ALL

    SELECT
        c.ID_CONTENT as id,
        'analysis' as type,
        c.TITLE,
        c.EXCERPT,
        c.PUBLISHED_AT,
        NULL as url
    FROM `{TABLE_CONTENT}` c
    WHERE c.STATUS = 'PUBLISHED'
      AND c.IS_ACTIVE = TRUE

    ORDER BY PUBLISHED_AT DESC
    LIMIT {limit}
    """

    rows = query_bq(sql)

    # 🔥 normalisation
    return [_normalize_item(r) for r in rows]


# ============================================================
# NORMALISATION (CRITIQUE)
# ============================================================

def _normalize_item(r: Dict) -> Dict:

    return {
        "id": r.get("id"),
        "type": r.get("type"),
        "title": r.get("TITLE"),
        "excerpt": r.get("EXCERPT"),
        "published_at": r.get("PUBLISHED_AT"),
        "url": r.get("url"),  # 🔥 clé
    }


# ============================================================
# HANDLER
# ============================================================

def handle_feed(entity: Dict, user_query: str) -> Dict:

    entity_label = entity.get("label")
    query = user_query.strip().lower() if user_query else ""

    # ----------------------------------------------------------
    # MODE GLOBAL
    # ----------------------------------------------------------

    if not entity_label and (
        not query or "quoi de neuf" in query or "actualité" in query
    ):
        rows = _get_latest_items(limit=10)

    # ----------------------------------------------------------
    # MODE SEARCH
    # ----------------------------------------------------------

    else:
        search_query = entity_label or user_query
        raw_rows = search_text(query=search_query, limit=10)
        rows = [_normalize_item(r) for r in raw_rows]

    # ----------------------------------------------------------
    # EMPTY
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
    # SUGGESTIONS
    # ----------------------------------------------------------

    suggestions = [
        "Retail Media",
        "CTV",
        "Amazon",
        "Netflix"
    ]

    # ----------------------------------------------------------
    # RESPONSE
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
