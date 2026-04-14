from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# VIEWS
# ============================================================

VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"

# ============================================================
# 🔥 USER FILTER FACTO
# ============================================================

def build_user_filter(alias: str = "c") -> str:
    return f"""
    AND EXISTS (
        SELECT 1
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOURCE_UNIVERSE` su
        JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE` uu
          ON uu.ID_UNIVERSE = su.ID_UNIVERSE
        WHERE uu.ID_USER = @user_id
          AND su.ID_SOURCE = {alias}.id_source
    )
    """


# ============================================================
# SEARCH
# ============================================================

def search(
    q: str,
    limit: int = 20,
    offset: int = 0,
    user_id: Optional[str] = None,
    universe_id: Optional[str] = None,
) -> List[Dict]:

    universe_filter = ""
    if universe_id:
        universe_filter = "AND c.id_universe = @universe_id"

    sql = f"""
    SELECT
        c.id_content AS id,
        'analysis' AS type,
        c.title,
        c.excerpt,
        c.published_at,
        NULL AS news_type,
        c.topics,
        c.id_universe,
        c.universe,
        c.companies,
        c.solutions

    FROM `{VIEW_CONTENT}` c

    WHERE
        (
          LOWER(c.title) LIKE LOWER(CONCAT('%', @query, '%'))
          OR LOWER(c.excerpt) LIKE LOWER(CONCAT('%', @query, '%'))
        )

    {build_user_filter("c")}

    {universe_filter}

    ORDER BY published_at DESC
    LIMIT @limit
    OFFSET @offset
    """

    params = {
        "query": q,
        "limit": limit,
        "offset": offset,
        "user_id": user_id,
        "universe_id": universe_id,
    }

    rows = query_bq(sql, params)

    return [_map_feed_row(r) for r in rows]


# ============================================================
# LATEST
# ============================================================

def latest(
    limit: int = 20,
    offset: int = 0,
    user_id: Optional[str] = None,
    universe_id: Optional[str] = None,
) -> List[Dict]:

    universe_filter = ""

    if universe_id:
        universe_filter = """
        AND EXISTS (
            SELECT 1
            FROM UNNEST(c.universes) u
            WHERE u.id_universe = @universe_id
        )
        """

    sql = f"""
    SELECT
        c.id_content AS id,
        'analysis' AS type,
        c.title,
        c.excerpt,
        c.published_at,
        NULL AS news_type,
        c.topics,
        c.universes,
        c.companies,
        c.solutions

    FROM `{VIEW_CONTENT}` c

    WHERE c.published_at IS NOT NULL

    {build_user_filter("c")}

    {universe_filter}

    ORDER BY published_at DESC
    LIMIT @limit
    OFFSET @offset
    """

    params = {
        "limit": limit,
        "offset": offset,
        "universe_id": universe_id,
        "user_id": user_id,
    }

    rows = query_bq(sql, params)

    return [_map_feed_row(r) for r in rows]


# ============================================================
# ITEM (light)
# ============================================================

def get_item_curator(
    item_id: str,
    user_id: Optional[str] = None
) -> Optional[Dict]:

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
            [] AS solutions,
            n.id_source

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
            c.solutions,
            c.id_source

        FROM `{VIEW_CONTENT}` c

    )
    WHERE id = @id

    AND (
        @user_id IS NULL
        OR EXISTS (
            SELECT 1
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOURCE_UNIVERSE` su
            JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE` uu
              ON uu.ID_UNIVERSE = su.ID_UNIVERSE
            WHERE uu.ID_USER = @user_id
              AND su.SOURCE_ID = id_source
        )
    )

    LIMIT 1
    """

    rows = query_bq(sql, {
        "id": item_id,
        "user_id": user_id,
    })

    if not rows:
        return None

    return _map_feed_row(rows[0])


# ============================================================
# DETAIL
# ============================================================

def get_item_detail(
    item_id: str,
    user_id: Optional[str] = None
) -> Optional[Dict]:

    item = get_item_curator(item_id, user_id=user_id)

    if not item:
        return None

    item_type = item.get("type")

    if item_type == "analysis":
        from core.content.public_service import get_content
        content = get_content(item_id)

        if not content:
            return None

        return {
            **content,
            "topics": item.get("topics", []),
            "companies": item.get("companies", []),
            "solutions": item.get("solutions", []),
        }

    elif item_type == "news":
        from core.news.service import get_news
        news = get_news(item_id)

        if not news:
            return None

        return {
            **news,
            "topics": item.get("topics", []),
            "companies": item.get("companies", []),
            "solutions": item.get("solutions", []),
        }

    return None


# ============================================================
# STATS (global)
# ============================================================

def get_content_stats():

    # =====================================================
    # GLOBAL
    # =====================================================

    global_rows = query_bq(f"""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_GLOBAL`
    """)

    if global_rows:
        g = global_rows[0]
        total_count = g.get("total", 0) or 0
        last_7 = g.get("last_7_days", 0) or 0
        last_30 = g.get("last_30_days", 0) or 0
    else:
        total_count = 0
        last_7 = 0
        last_30 = 0

    # =====================================================
    # TOPICS
    # =====================================================

    topics_rows = query_bq(f"""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_TOPIC`
        ORDER BY total DESC
    """)

    topics_stats = [
        {
            "id_topic": r.get("id_topic"),
            "label": r.get("label"),
            "total_count": r.get("total", 0) or 0,
            "last_7_days": r.get("last_7_days", 0) or 0,
            "last_30_days": r.get("last_30_days", 0) or 0,
        }
        for r in topics_rows
        if r.get("id_topic") and r.get("label")
    ]

    # =====================================================
    # COMPANIES
    # =====================================================

    company_rows = query_bq(f"""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_COMPANY`
        ORDER BY total DESC
    """)

    top_companies = [
        {
            "id_company": r.get("id_company"),
            "name": r.get("name"),
            "total_count": r.get("total", 0) or 0,
            "last_7_days": r.get("last_7_days", 0) or 0,
            "last_30_days": r.get("last_30_days", 0) or 0,
        }
        for r in company_rows
        if r.get("id_company") and r.get("name")
    ]

    # =====================================================
    # SOLUTIONS
    # =====================================================

    solution_rows = query_bq(f"""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_SOLUTION`
        ORDER BY total DESC
    """)

    top_solutions = [
        {
            "id_solution": r.get("id_solution"),
            "name": r.get("name"),
            "total_count": r.get("total", 0) or 0,
            "last_7_days": r.get("last_7_days", 0) or 0,
            "last_30_days": r.get("last_30_days", 0) or 0,
        }
        for r in solution_rows
        if r.get("id_solution") and r.get("name")
    ]

    return {
        "total_count": total_count,
        "last_7_days": last_7,
        "last_30_days": last_30,
        "topics_stats": topics_stats,
        "top_companies": top_companies,
        "top_solutions": top_solutions,
    }

# ============================================================
# MAPPER
# ============================================================

def _map_feed_row(r: Dict) -> Dict:

    return {
        "id": r.get("id"),
        "type": r.get("type"),
        "title": r.get("title"),
        "excerpt": r.get("excerpt"),
        "published_at": r.get("published_at"),
        "news_type": r.get("news_type"),
        "id_universe": r.get("id_universe"),
        "universe": r.get("universe"),
        "topics": r.get("topics") or [],
        "companies": r.get("companies") or [],
        "solutions": r.get("solutions") or [],
    }
