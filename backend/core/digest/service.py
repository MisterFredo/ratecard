from typing import Optional, List, Dict, Any

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# VIEWS
# ============================================================

VIEW_NEWS_ENRICHED = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT_ENRICHED = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"
VIEW_NUMBERS_ENRICHED = f"{BQ_PROJECT}.{BQ_DATASET}.V_NUMBERS_ENRICHED"


# ============================================================
# PUBLIC API
# ============================================================

from typing import Optional, List, Dict, Any

# ============================================================
# MAIN
# ============================================================

def search_digest(
    topics: Optional[List[str]] = None,
    companies: Optional[List[str]] = None,
    news_types: Optional[List[str]] = None,
    limit: int = 20,
    cursor: Optional[str] = None,
    period: Optional[str] = "total",
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> Dict[str, Any]:

    # =========================================================
    # PRIORITÉ AUX DATES
    # =========================================================

    use_period = period
    if date_from or date_to:
        use_period = None

    # =========================
    # NEWS
    # =========================
    news = _search_news_digest(
        topics=topics,
        companies=companies,
        news_types=news_types,
        limit=limit,
        cursor=cursor,
        news_kind="NEWS",
        period=use_period,
        date_from=date_from,
        date_to=date_to,
    )

    # =========================
    # BRÈVES
    # =========================
    breves = _search_news_digest(
        topics=topics,
        companies=companies,
        news_types=news_types,
        limit=limit,
        cursor=cursor,
        news_kind="BRIEF",
        period=use_period,
        date_from=date_from,
        date_to=date_to,
    )

    # =========================
    # ANALYSES
    # =========================
    analyses = _search_analyses_digest(
        topics=topics,
        companies=companies,
        limit=limit,
        cursor=cursor,
        period=use_period,
        date_from=date_from,
        date_to=date_to,
    )

    # =========================
    # NUMBERS
    # =========================
    numbers = _search_numbers_digest(
        topics=topics,
        companies=companies,
        limit=limit,
        period=use_period,
        date_from=date_from,
        date_to=date_to,
    )

    return {
        "news": news,
        "breves": breves,
        "analyses": analyses,
        "numbers": numbers,
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
    date_from=None,
    date_to=None,
):

    where_clauses = [
        "status = 'PUBLISHED'",
        "published_at IS NOT NULL",
        f"news_kind = '{news_kind}'",
    ]

    params = {"limit": limit}

    # -------------------------
    # FILTERS
    # -------------------------

    if topics:
        where_clauses.append("""
            EXISTS (
                SELECT 1
                FROM UNNEST(topics) t
                WHERE t.id_topic IN UNNEST(@topics)
            )
        """)
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

    # -------------------------
    # DATE OVERRIDE
    # -------------------------

    if date_from:
        where_clauses.append("DATE(published_at) >= DATE(@date_from)")
        params["date_from"] = date_from

    if date_to:
        where_clauses.append("DATE(published_at) <= DATE(@date_to)")
        params["date_to"] = date_to

    # -------------------------
    # PERIOD
    # -------------------------

    if not date_from and not date_to:
        if period == "7d":
            where_clauses.append(
                "DATE(published_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)"
            )
        elif period == "30d":
            where_clauses.append(
                "DATE(published_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)"
            )

    # -------------------------
    # SQL
    # -------------------------

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
        WHERE {" AND ".join(where_clauses)}
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
# ANALYSES
# ============================================================

def _search_analyses_digest(
    topics,
    companies,
    limit,
    cursor,
    period,
    date_from=None,
    date_to=None,
):

    where_clauses = [
        "published_at IS NOT NULL",
    ]

    params = {"limit": limit}

    # -------------------------
    # FILTERS
    # -------------------------

    if topics:
        where_clauses.append("""
            EXISTS (
                SELECT 1
                FROM UNNEST(topics) t
                WHERE t.id_topic IN UNNEST(@topics)
            )
        """)
        params["topics"] = topics

    if companies:
        where_clauses.append("""
            EXISTS (
                SELECT 1
                FROM UNNEST(companies) c
                WHERE c.id_company IN UNNEST(@companies)
            )
        """)
        params["companies"] = companies

    if cursor:
        where_clauses.append("published_at < @cursor")
        params["cursor"] = cursor

    # -------------------------
    # DATE OVERRIDE
    # -------------------------

    if date_from:
        where_clauses.append("DATE(published_at) >= DATE(@date_from)")
        params["date_from"] = date_from

    if date_to:
        where_clauses.append("DATE(published_at) <= DATE(@date_to)")
        params["date_to"] = date_to

    # -------------------------
    # PERIOD
    # -------------------------

    if not date_from and not date_to:
        if period == "7d":
            where_clauses.append(
                "DATE(published_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)"
            )
        elif period == "30d":
            where_clauses.append(
                "DATE(published_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)"
            )

    # -------------------------
    # SQL
    # -------------------------

    sql = f"""
        SELECT
            id_content,
            title,
            excerpt,
            published_at,
            topics,
            companies
        FROM `{VIEW_CONTENT_ENRICHED}`
        WHERE {" AND ".join(where_clauses)}
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

def _search_numbers_digest(
    topics,
    companies,
    limit,
    period,
):

    where_clauses = []
    params = {"limit": limit}

    # 🔥 FILTER TOPICS
    if topics:
        where_clauses.append("""
            EXISTS (
                SELECT 1
                FROM UNNEST(@topics) t
                WHERE ENTITY_TYPE = 'topic'
                AND ENTITY_ID = t
            )
        """)
        params["topics"] = topics

    # 🔥 FILTER COMPANIES
    if companies:
        where_clauses.append("""
            ENTITY_TYPE = 'company'
            AND ENTITY_ID IN UNNEST(@companies)
        """)
        params["companies"] = companies

    # 🔥 PERIOD (based on CREATED_AT)
    if period == "7d":
        where_clauses.append(
            "DATE(CREATED_AT) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)"
        )
    elif period == "30d":
        where_clauses.append(
            "DATE(CREATED_AT) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)"
        )

    where_sql = ""
    if where_clauses:
        where_sql = "WHERE " + " AND ".join(where_clauses)

    sql = f"""
        SELECT
            ID_NUMBER,
            ENTITY_TYPE,
            ENTITY_ID,
            ENTITY_LABEL,
            LABEL,
            VALUE,
            UNIT,
            SCALE,
            TYPE,
            CATEGORY,
            ZONE,
            PERIOD,
            CREATED_AT
        FROM `{VIEW_NUMBERS_ENRICHED}`
        {where_sql}
        ORDER BY CREATED_AT DESC
        LIMIT @limit
    """

    rows = query_bq(sql, params)

    return [
        {
            "id": r["ID_NUMBER"],
            "label": r["LABEL"],
            "value": r["VALUE"],
            "unit": r["UNIT"],
            "scale": r["SCALE"],
            "type": r["TYPE"],
            "category": r["CATEGORY"],
            "zone": r["ZONE"],
            "period": r["PERIOD"],
            "created_at": r["CREATED_AT"],
            "entity": {
                "type": r["ENTITY_TYPE"],
                "id": r["ENTITY_ID"],
                "label": r["ENTITY_LABEL"],
            },
        }
        for r in rows
    ]
