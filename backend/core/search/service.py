from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# TABLES
# ============================================================

TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"


# ============================================================
# SEARCH (NEWS + ANALYSES)
# ============================================================

def search(
    q: str,
    limit: int = 20,
    offset: int = 0,
    type: Optional[str] = None,  # 🔥 NEW
) -> Dict:
    """
    Recherche full-text sur NEWS + ANALYSES
    via BigQuery SEARCH INDEX.

    Ajouts :
    - filtrage par type (news / analysis)
    - pagination (offset)
    - format aligné FeedItem
    """

    # ============================================================
    # TYPE FILTER SQL
    # ============================================================

    news_filter = ""
    content_filter = ""

    if type == "news":
        content_filter = "AND FALSE"  # bloque analyses
    elif type == "analysis":
        news_filter = "AND FALSE"  # bloque news

    # ============================================================
    # SQL
    # ============================================================

    sql = f"""
    -- NEWS
    SELECT
        n.ID_NEWS as id,
        n.TITLE as title,
        n.EXCERPT as excerpt,
        'news' as type,
        n.PUBLISHED_AT as published_at
    FROM `{TABLE_NEWS}` n
    WHERE n.STATUS = 'PUBLISHED'
      AND SEARCH(n, @query)
      {news_filter}

    UNION ALL

    -- ANALYSES
    SELECT
        c.ID_CONTENT as id,
        c.TITLE as title,
        c.EXCERPT as excerpt,
        'analysis' as type,
        c.PUBLISHED_AT as published_at
    FROM `{TABLE_CONTENT}` c
    WHERE c.STATUS = 'PUBLISHED'
      AND SEARCH(c, @query)
      {content_filter}

    ORDER BY published_at DESC
    LIMIT @limit
    OFFSET @offset
    """

    rows = query_bq(
        sql,
        {
            "query": q,
            "limit": limit,
            "offset": offset,
        }
    )

    # ============================================================
    # FORMAT (ALIGN FRONT)
    # ============================================================

    items = [
        {
            "id": r.get("id"),
            "type": r.get("type"),  # 🔥 clé critique
            "title": r.get("title"),
            "excerpt": r.get("excerpt"),
            "published_at": r.get("published_at"),
        }
        for r in rows
    ]

    return {
        "items": items,
        "count": len(items),  # simple pour V1
    }
