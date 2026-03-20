from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq

# 🔥 vues unifiées
VIEW_FEED = f"{BQ_PROJECT}.{BQ_DATASET}.V_FEED_UNIFIED"


# ============================================================
# SEARCH (GOOGLE-LIKE)
# ============================================================

def search(q: str, limit: int = 20):

    sql = f"""
    SELECT
        id_news as id,
        'news' as type,
        title,
        excerpt,
        published_at,
        news_type,
        topics,
        ARRAY<STRUCT<id_company STRING, name STRING>>[
          STRUCT(id_company, company_name)
        ] as companies,
        [] as solutions

    FROM `{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED`
    WHERE LOWER(title) LIKE LOWER(CONCAT('%', @query, '%'))

    UNION ALL

    SELECT
        id_content as id,
        'analysis' as type,
        title,
        excerpt,
        published_at,
        NULL as news_type,
        topics,
        companies,
        solutions

    FROM `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED`
    WHERE LOWER(title) LIKE LOWER(CONCAT('%', @query, '%'))

    ORDER BY published_at DESC
    LIMIT @limit
    """

    rows = query_bq(sql, {"query": q, "limit": limit})

    return [_map_feed_row(r) for r in rows]


# ============================================================
# GET ITEM (LIGHT — FEED LEVEL)
# ============================================================

def get_item_curator(item_id: str) -> Optional[Dict]:

    rows = query_bq(
        f"""
        SELECT
            id,
            type,
            title,
            excerpt,
            published_at,
            news_type,
            topics,
            companies,
            solutions
        FROM `{VIEW_FEED}`
        WHERE id = @id
        LIMIT 1
        """,
        {"id": item_id},
    )

    if not rows:
        return None

    return _map_feed_row(rows[0])


# ============================================================
# GET DETAIL (FULL — VIA ADMIN)
# ============================================================

def get_item_detail(item_id: str, item_type: str) -> Optional[Dict]:
    """
    Route vers les fonctions admin existantes.
    """

    # ⚠️ import local pour éviter dépendances circulaires
    if item_type == "analysis":
        from core.content.public_service import get_content
        return get_content(item_id)

    elif item_type == "news":
        from core.news.service import get_news
        return get_news(item_id)

    return None


# ============================================================
# MAPPER (BQ → FRONT)
# ============================================================

def _map_feed_row(r: Dict) -> Dict:

    def map_dt(value):
        return value.isoformat() if value else None

    return {
        "id": r.get("id"),
        "type": r.get("type"),

        "title": r.get("title"),
        "excerpt": r.get("excerpt"),
        "published_at": map_dt(r.get("published_at")),

        # 🔥 badges (déjà enrichis côté BQ)
        "news_type": r.get("news_type"),
        "topics": r.get("topics") or [],
        "companies": r.get("companies") or [],
        "solutions": r.get("solutions") or [],
    }
