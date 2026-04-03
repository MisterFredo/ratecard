from typing import Optional, List, Dict, Any

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# VIEWS
# ============================================================

VIEW_NEWS_ENRICHED = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT_ENRICHED = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"


# ============================================================
# PUBLIC API
# ============================================================

def search_digest(
    topics: Optional[List[str]] = None,
    companies: Optional[List[str]] = None,
    news_types: Optional[List[str]] = None,
    limit: int = 20,
    cursor: Optional[str] = None,
    period: Optional[str] = "total",
) -> Dict[str, Any]:

    news = _search_news_digest(
        topics, companies, news_types, limit, cursor, "NEWS", period
    )

    breves = _search_news_digest(
        topics, companies, news_types, limit, cursor, "BRIEF", period
    )

    analyses = _search_analyses_digest(
        topics, companies, limit, cursor, period
    )

    return {
        "news": news,
        "breves": breves,
        "analyses": analyses,
    }


# ============================================================
# NEWS / BRÈVES
# ============================================================

def _search_news_digest(
    topics,
    companies,
    news_types,
    limit,
    cursor,
    news_kind,
    period,
):

    where_clauses = [
        "status = 'PUBLISHED'",
        "published_at IS NOT NULL",
        f"news_kind = '{news_kind}'",
    ]

    params = {"limit": limit}

    # 🔥 TOPICS (OK avec ta vue)
    if topics:
        where_clauses.append("""
            EXISTS (
                SELECT 1
                FROM UNNEST(topics) t
                WHERE t.id_topic IN UNNEST(@topics)
            )
        """)
        params["topics"] = topics

    # 🔥 COMPANY
    if companies:
        where_clauses.append("id_company IN UNNEST(@companies)")
        params["companies"] = companies

    # 🔥 NEWS TYPE
    if news_types:
        where_clauses.append("news_type IN UNNEST(@news_types)")
        params["news_types"] = news_types

    # 🔥 CURSOR
    if cursor:
        where_clauses.append("published_at < @cursor")
        params["cursor"] = cursor

    # 🔥 PERIOD
    if period == "7d":
        where_clauses.append(
            "DATE(published_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)"
        )
    elif period == "30d":
        where_clauses.append(
            "DATE(published_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)"
        )

    where_sql = " AND ".join(where_clauses)

    sql = f"""
        SELECT
            id_news,
            title,
            excerpt,
            published_at,
            news_type,
            news_kind,
            visual_rect_id,
            id_company,
            company_name,
            is_partner,
            topics
        FROM `{VIEW_NEWS_ENRICHED}`
        WHERE {where_sql}
        ORDER BY published_at DESC
        LIMIT @limit
    """

    rows = query_bq(sql, params)

    return [
        {
            "id": r["id_news"],
            "title": r["title"],
            "excerpt": r["excerpt"],
            "published_at": r["published_at"],
            "news_type": r["news_type"],
            "news_kind": r["news_kind"],
            "visual_rect_id": r["visual_rect_id"],
            "company": {
                "id_company": r["id_company"],
                "name": r["company_name"],
                "is_partner": bool(r["is_partner"]),
            },
            "topics": r["topics"] or [],
        }
        for r in rows
    ]


# ============================================================
# ANALYSES (🔥 FIX MAJEUR ICI)
# ============================================================

def _search_analyses_digest(
    topics,
    companies,
    limit,
    cursor,
    period,
):

    where_clauses = [
        "published_at IS NOT NULL",
    ]

    params = {"limit": limit}

    # 🔥 TOPICS (ARRAY dans la vue)
    if topics:
        where_clauses.append("""
            EXISTS (
                SELECT 1
                FROM UNNEST(topics) t
                WHERE t.id_topic IN UNNEST(@topics)
            )
        """)
        params["topics"] = topics

    # 🔥 COMPANIES (ARRAY dans la vue)
    if companies:
        where_clauses.append("""
            EXISTS (
                SELECT 1
                FROM UNNEST(companies) c
                WHERE c.id_company IN UNNEST(@companies)
            )
        """)
        params["companies"] = companies

    # 🔥 CURSOR
    if cursor:
        where_clauses.append("published_at < @cursor")
        params["cursor"] = cursor

    # 🔥 PERIOD
    if period == "7d":
        where_clauses.append(
            "DATE(published_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)"
        )
    elif period == "30d":
        where_clauses.append(
            "DATE(published_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)"
        )

    where_sql = " AND ".join(where_clauses)

    sql = f"""
        SELECT
            id_content,
            title,
            excerpt,
            published_at,
            topics,
            companies
        FROM `{VIEW_CONTENT_ENRICHED}`
        WHERE {where_sql}
        ORDER BY published_at DESC
        LIMIT @limit
    """

    rows = query_bq(sql, params)

    return [
        {
            "id": r["id_content"],
            "title": r["title"],
            "excerpt": r["excerpt"],
            "published_at": r["published_at"],
            "topics": r["topics"] or [],
            "companies": r["companies"] or [],
        }
        for r in rows
    ]
