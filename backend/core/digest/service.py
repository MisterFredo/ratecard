from typing import Optional, List, Dict, Any
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# TABLES / VIEWS
# ============================================================

VIEW_NEWS_ENRICHED = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"

TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"


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
        topics=topics,
        companies=companies,
        news_types=news_types,
        limit=limit,
        cursor=cursor,
        news_kind="NEWS",
        period=period,
    )

    breves = _search_news_digest(
        topics=topics,
        companies=companies,
        news_types=news_types,
        limit=limit,
        cursor=cursor,
        news_kind="BRIEF",
        period=period,
    )

    analyses = _search_analyses_digest(
        topics=topics,
        companies=companies,
        limit=limit,
        cursor=cursor,
        period=period,
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
    topics: Optional[List[str]],
    companies: Optional[List[str]],
    news_types: Optional[List[str]],
    limit: int,
    cursor: Optional[str],
    news_kind: str,
    period: Optional[str],
):

    where_clauses = [
        "status = 'PUBLISHED'",
        "published_at IS NOT NULL",
        f"news_kind = '{news_kind}'",
    ]

    params = {
        "limit": limit
    }

    if topics:
        where_clauses.append(
            """
            EXISTS (
                SELECT 1
                FROM UNNEST(topics) t
                WHERE t.id_topic IN UNNEST(@topics)
            )
            """
        )
        params["topics"] = topics

    if companies:
        where_clauses.append("id_company IN UNNEST(@companies)")
        params["companies"] = companies

    if news_types:
        where_clauses.append("news_type IN UNNEST(@news_types)")
        params["news_types"] = news_types

    if cursor:
        where_clauses.append("published_at < @cursor")
        params["cursor"] = cursor

    # Period filter
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
            "id": r.get("id_news"),
            "title": r.get("title"),
            "excerpt": r.get("excerpt"),
            "published_at": r.get("published_at"),
            "news_type": r.get("news_type"),
            "news_kind": r.get("news_kind"),
            "visual_rect_id": r.get("visual_rect_id"),
            "company": {
                "id_company": r.get("id_company"),
                "name": r.get("company_name"),
                "is_partner": bool(r.get("is_partner")),
            },
            "topics": r.get("topics") or [],
        }
        for r in rows
    ]

# ============================================================
# ANALYSES
# ============================================================

def _search_analyses_digest(
    topics: Optional[List[str]],
    companies: Optional[List[str]],
    limit: int,
    cursor: Optional[str],
    period: Optional[str],
):

    where_clauses = [
        "C.STATUS = 'PUBLISHED'",
        "C.IS_ACTIVE = TRUE",
        "C.PUBLISHED_AT IS NOT NULL",
    ]

    params = {
        "limit": limit
    }

    if topics:
        where_clauses.append(
            f"""
            EXISTS (
                SELECT 1
                FROM `{TABLE_CONTENT_TOPIC}` CT
                WHERE CT.ID_CONTENT = C.ID_CONTENT
                  AND CT.ID_TOPIC IN UNNEST(@topics)
            )
            """
        )
        params["topics"] = topics

    if companies:
        where_clauses.append(
            f"""
            EXISTS (
                SELECT 1
                FROM `{TABLE_CONTENT_COMPANY}` CC
                WHERE CC.ID_CONTENT = C.ID_CONTENT
                  AND CC.ID_COMPANY IN UNNEST(@companies)
            )
            """
        )
        params["companies"] = companies

    if cursor:
        where_clauses.append("C.PUBLISHED_AT < @cursor")
        params["cursor"] = cursor

    # Period filter
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
            C.ID_CONTENT,
            C.ANGLE_TITLE,
            C.EXCERPT,
            C.PUBLISHED_AT
        FROM `{TABLE_CONTENT}` C
        WHERE {where_sql}
        ORDER BY C.PUBLISHED_AT DESC
        LIMIT @limit
    """

    rows = query_bq(sql, params)

    return [
        {
            "id": r.get("ID_CONTENT"),
            "title": r.get("ANGLE_TITLE"),
            "excerpt": r.get("EXCERPT"),
            "published_at": r.get("PUBLISHED_AT"),
        }
        for r in rows
    ]
