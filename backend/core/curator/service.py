from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# VIEWS (SOURCE OF TRUTH)
# ============================================================

VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"


# ============================================================
# SEARCH (UNION SIMPLE, ROBUSTE)
# ============================================================

def search(q: str, limit: int = 20) -> List[Dict]:

    sql = f"""
    -- ============================
    -- NEWS
    -- ============================
    SELECT
        n.id_news AS id,
        'news' AS type,
        n.title,
        n.excerpt,
        n.published_at,
        n.news_type,

        n.topics,

        ARRAY<STRUCT<id_company STRING, name STRING>>[
          STRUCT(n.id_company, n.company_name)
        ] AS companies,

        [] AS solutions

    FROM `{VIEW_NEWS}` n
    WHERE
        LOWER(n.title) LIKE LOWER(CONCAT('%', @query, '%'))
        OR LOWER(n.excerpt) LIKE LOWER(CONCAT('%', @query, '%'))


    UNION ALL


    -- ============================
    -- CONTENT (ANALYSES)
    -- ============================
    SELECT
        c.id_content AS id,
        'analysis' AS type,
        c.title,
        c.excerpt,
        c.published_at,
        NULL AS news_type,

        c.topics,
        c.companies,
        c.solutions

    FROM `{VIEW_CONTENT}` c
    WHERE
        LOWER(c.title) LIKE LOWER(CONCAT('%', @query, '%'))
        OR LOWER(c.excerpt) LIKE LOWER(CONCAT('%', @query, '%'))


    ORDER BY published_at DESC
    LIMIT @limit
    """

    rows = query_bq(sql, {"query": q, "limit": limit})

    return [_map_feed_row(r) for r in rows]


# ============================================================
# ITEM (LIGHT — FEED LEVEL)
# ============================================================

def get_item_curator(item_id: str) -> Optional[Dict]:

    sql = f"""
    SELECT * FROM (
        SELECT
            n.id_news AS id,
            'news' AS type,
            n.title,
            n.excerpt,
            n.published_at,
            n.news_type,
            n.topics,
            ARRAY<STRUCT<id_company STRING, name STRING>>[
              STRUCT(n.id_company, n.company_name)
            ] AS companies,
            [] AS solutions
        FROM `{VIEW_NEWS}` n

        UNION ALL

        SELECT
            c.id_content AS id,
            'analysis' AS type,
            c.title,
            c.excerpt,
            c.published_at,
            NULL AS news_type,
            c.topics,
            c.companies,
            c.solutions
        FROM `{VIEW_CONTENT}` c
    )
    WHERE id = @id
    LIMIT 1
    """

    rows = query_bq(sql, {"id": item_id})

    if not rows:
        return None

    return _map_feed_row(rows[0])


# ============================================================
# DETAIL (FULL — ADMIN DELEGATION)
# ============================================================

def get_item_detail(item_id: str, item_type: str) -> Optional[Dict]:

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

        # 🔥 badges structurés (direct depuis BQ)
        "news_type": r.get("news_type"),
        "topics": r.get("topics") or [],
        "companies": r.get("companies") or [],
        "solutions": r.get("solutions") or [],
    }
