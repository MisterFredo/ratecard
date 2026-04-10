from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# VIEWS
# ============================================================

VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"


# ============================================================
# SEARCH (avec pagination)
# ============================================================

def search(
    q: str,
    limit: int = 20,
    offset: int = 0,
    type: Optional[str] = None,
    user_id: Optional[str] = None,
) -> List[Dict]:

    news_filter = ""
    content_filter = ""

    if type == "news":
        content_filter = "AND FALSE"
    elif type == "analysis":
        news_filter = "AND FALSE"

    # ============================================================
    # 🔥 UNIVERS FILTER (SAFE)
    # → ne filtre que si user a des univers
    # ============================================================

    universe_filter_news = ""
    universe_filter_content = ""

    if user_id:

        universe_filter_news = f"""
        AND (
            NOT EXISTS (
                SELECT 1
                FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE`
                WHERE ID_USER = @user_id
            )
            OR EXISTS (
                SELECT 1
                FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE` uu
                JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE` cu
                    ON cu.ID_UNIVERSE = uu.ID_UNIVERSE
                WHERE uu.ID_USER = @user_id
                  AND cu.ID_COMPANY = n.id_company
            )
        )
        """

        universe_filter_content = f"""
        AND (
            NOT EXISTS (
                SELECT 1
                FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE`
                WHERE ID_USER = @user_id
            )
            OR EXISTS (
                SELECT 1
                FROM UNNEST(c.companies) comp
                JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE` cu
                    ON cu.ID_COMPANY = comp.id_company
                JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE` uu
                    ON uu.ID_UNIVERSE = cu.ID_UNIVERSE
                WHERE uu.ID_USER = @user_id
            )
        )
        """

    # ============================================================
    # QUERY
    # ============================================================

    sql = f"""
    -- NEWS
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
        (
          LOWER(n.title) LIKE LOWER(CONCAT('%', @query, '%'))
          OR LOWER(n.excerpt) LIKE LOWER(CONCAT('%', @query, '%'))
        )
        {news_filter}
        {universe_filter_news}

    UNION ALL

    -- CONTENT
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
        (
          LOWER(c.title) LIKE LOWER(CONCAT('%', @query, '%'))
          OR LOWER(c.excerpt) LIKE LOWER(CONCAT('%', @query, '%'))
        )
        {content_filter}
        {universe_filter_content}

    ORDER BY published_at DESC
    LIMIT @limit
    OFFSET @offset
    """

    # ============================================================
    # PARAMS
    # ============================================================

    params = {
        "query": q,
        "limit": limit,
        "offset": offset,
    }

    if user_id:
        params["user_id"] = user_id

    rows = query_bq(sql, params)

    return [_map_feed_row(r) for r in rows]

# ============================================================
# LATEST (landing page)
# ============================================================

def latest(
    limit: int = 20,
    offset: int = 0,
    type: Optional[str] = None,
    user_id: Optional[str] = None,
) -> List[Dict]:

    news_filter = ""
    content_filter = ""

    if type == "news":
        content_filter = "AND FALSE"
    elif type == "analysis":
        news_filter = "AND FALSE"

    # ============================================================
    # 🔥 UNIVERS FILTER (SAFE)
    # ============================================================

    universe_filter_news = ""
    universe_filter_content = ""

    if user_id:

        universe_filter_news = f"""
        AND (
            NOT EXISTS (
                SELECT 1
                FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE`
                WHERE ID_USER = @user_id
            )
            OR EXISTS (
                SELECT 1
                FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE` uu
                JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE` cu
                    ON cu.ID_UNIVERSE = uu.ID_UNIVERSE
                WHERE uu.ID_USER = @user_id
                  AND cu.ID_COMPANY = n.id_company
            )
        )
        """

        universe_filter_content = f"""
        AND (
            NOT EXISTS (
                SELECT 1
                FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE`
                WHERE ID_USER = @user_id
            )
            OR EXISTS (
                SELECT 1
                FROM UNNEST(c.companies) comp
                JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE` cu
                    ON cu.ID_COMPANY = comp.id_company
                JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE` uu
                    ON uu.ID_UNIVERSE = cu.ID_UNIVERSE
                WHERE uu.ID_USER = @user_id
            )
        )
        """

    # ============================================================
    # QUERY
    # ============================================================

    sql = f"""
    SELECT * FROM (

        -- NEWS
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
        WHERE n.published_at IS NOT NULL
        {news_filter}
        {universe_filter_news}

        UNION ALL

        -- CONTENT
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
        WHERE c.published_at IS NOT NULL
        {content_filter}
        {universe_filter_content}

    )
    ORDER BY published_at DESC
    LIMIT @limit
    OFFSET @offset
    """

    params = {
        "limit": limit,
        "offset": offset,
    }

    if user_id:
        params["user_id"] = user_id

    rows = query_bq(sql, params)

    return [_map_feed_row(r) for r in rows]

# ============================================================
# ITEM (light)
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
# DETAIL (full)
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
# STATS (CONTENT)
# ============================================================

def get_content_stats(user_id: Optional[str] = None):

    # =====================================================
    # GLOBAL (non filtré volontairement)
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
    # TOPICS (pas filtré volontairement)
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
            "total": r.get("total", 0) or 0,
            "last_7_days": r.get("last_7_days", 0) or 0,
            "last_30_days": r.get("last_30_days", 0) or 0,
        }
        for r in topics_rows
        if r.get("id_topic") and r.get("label")
    ]

    # =====================================================
    # COMPANIES (🔥 filtré par univers)
    # =====================================================

    company_sql = f"""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_COMPANY` c
        WHERE TRUE
        {"AND EXISTS (
            SELECT 1
            FROM `" + BQ_PROJECT + "." + BQ_DATASET + ".RATECARD_COMPANY_UNIVERSE` cu
            JOIN `" + BQ_PROJECT + "." + BQ_DATASET + ".RATECARD_USER_UNIVERSE` uu
              ON uu.ID_UNIVERSE = cu.ID_UNIVERSE
            WHERE uu.ID_USER = @user_id
              AND cu.ID_COMPANY = c.id_company
        )" if user_id else ""}
        ORDER BY total DESC
    """

    company_rows = query_bq(
        company_sql,
        {"user_id": user_id} if user_id else {}
    )

    top_companies = [
        {
            "id_company": r.get("id_company"),
            "name": r.get("name"),
            "total": r.get("total", 0) or 0,
            "last_7_days": r.get("last_7_days", 0) or 0,
            "last_30_days": r.get("last_30_days", 0) or 0,
        }
        for r in company_rows
        if r.get("id_company") and r.get("name")
    ]

    # =====================================================
    # SOLUTIONS (🔥 filtré via COMPANY)
    # =====================================================

    solution_sql = f"""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_SOLUTION` s
        WHERE TRUE
        {"AND EXISTS (
            SELECT 1
            FROM `" + BQ_PROJECT + "." + BQ_DATASET + ".RATECARD_SOLUTION` sol
            JOIN `" + BQ_PROJECT + "." + BQ_DATASET + ".RATECARD_COMPANY_UNIVERSE` cu
              ON cu.ID_COMPANY = sol.ID_COMPANY
            JOIN `" + BQ_PROJECT + "." + BQ_DATASET + ".RATECARD_USER_UNIVERSE` uu
              ON uu.ID_UNIVERSE = cu.ID_UNIVERSE
            WHERE uu.ID_USER = @user_id
              AND sol.ID_SOLUTION = s.id_solution
        )" if user_id else ""}
        ORDER BY total DESC
    """

    solution_rows = query_bq(
        solution_sql,
        {"user_id": user_id} if user_id else {}
    )

    top_solutions = [
        {
            "id_solution": r.get("id_solution"),
            "name": r.get("name"),
            "total": r.get("total", 0) or 0,
            "last_7_days": r.get("last_7_days", 0) or 0,
            "last_30_days": r.get("last_30_days", 0) or 0,
        }
        for r in solution_rows
        if r.get("id_solution") and r.get("name")
    ]

    # =====================================================
    # RETURN
    # =====================================================

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

    def map_dt(value):
        return value.isoformat() if value else None

    return {
        "id": r.get("id"),
        "type": r.get("type"),
        "title": r.get("title"),
        "excerpt": r.get("excerpt"),
        "published_at": map_dt(r.get("published_at")),
        "news_type": r.get("news_type"),
        "topics": r.get("topics") or [],
        "companies": r.get("companies") or [],
        "solutions": r.get("solutions") or [],
    }
