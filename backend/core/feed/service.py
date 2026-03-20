from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

TABLE_NEWS_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_TOPIC"
TABLE_NEWS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_SOLUTION"

TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_CONTENT_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_SOLUTION"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"


# ============================================================
# SEARCH UNIFIÉ CURATOR
# ============================================================

def search_curator(
    query: Optional[str] = None,
    topic_ids: Optional[List[str]] = None,
    company_ids: Optional[List[str]] = None,
    solution_ids: Optional[List[str]] = None,
    news_types: Optional[List[str]] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[Dict]:

    # ============================================================
    # NORMALISATION (CRITIQUE)
    # ============================================================

    query = query.strip().lower() if query and query.strip() != "" else None

    topic_ids = topic_ids if topic_ids else None
    company_ids = company_ids if company_ids else None
    solution_ids = solution_ids if solution_ids else None
    news_types = news_types if news_types else None

    # ============================================================
    # SQL
    # ============================================================

    sql = f"""
    -- =========================
    -- NEWS
    -- =========================
    SELECT
        n.ID_NEWS as id,
        'news' as type,
        n.TITLE,
        n.EXCERPT,
        n.PUBLISHED_AT
    FROM `{TABLE_NEWS}` n
    WHERE n.STATUS = 'PUBLISHED'

    AND (
        @query IS NULL
        OR LOWER(n.TITLE) LIKE CONCAT('%', @query, '%')
        OR LOWER(n.EXCERPT) LIKE CONCAT('%', @query, '%')
    )

    AND (
        ARRAY_LENGTH(@news_types) = 0
        OR n.NEWS_TYPE IN UNNEST(@news_types)
    )

    AND (
        ARRAY_LENGTH(@company_ids) = 0
        OR n.ID_COMPANY IN UNNEST(@company_ids)
    )

    AND (
        @topic_ids IS NULL OR ARRAY_LENGTH(@topic_ids) = 0
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_NEWS_TOPIC}` nt
            WHERE nt.ID_NEWS = n.ID_NEWS
              AND nt.ID_TOPIC IN UNNEST(@topic_ids)
        )
    )

    AND (
        ARRAY_LENGTH(@solution_ids) = 0
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_NEWS_SOLUTION}` ns
            WHERE ns.ID_NEWS = n.ID_NEWS
              AND ns.ID_SOLUTION IN UNNEST(@solution_ids)
        )
    )

    UNION ALL

    -- =========================
    -- CONTENT
    -- =========================
    SELECT
        c.ID_CONTENT as id,
        'analysis' as type,
        c.TITLE,
        c.EXCERPT,
        c.PUBLISHED_AT
    FROM `{TABLE_CONTENT}` c
    WHERE c.STATUS = 'PUBLISHED'
      AND c.IS_ACTIVE = TRUE

    AND (
        @query IS NULL
        OR LOWER(c.TITLE) LIKE CONCAT('%', @query, '%')
        OR LOWER(c.EXCERPT) LIKE CONCAT('%', @query, '%')
    )

    AND (
        ARRAY_LENGTH(@company_ids) = 0
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_CONTENT_COMPANY}` cc
            WHERE cc.ID_CONTENT = c.ID_CONTENT
              AND cc.ID_COMPANY IN UNNEST(@company_ids)
        )
    )

    AND (
        ARRAY_LENGTH(@topic_ids) = 0
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_CONTENT_TOPIC}` ct
            WHERE ct.ID_CONTENT = c.ID_CONTENT
              AND ct.ID_TOPIC IN UNNEST(@topic_ids)
        )
    )

    AND (
        ARRAY_LENGTH(@solution_ids) = 0
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_CONTENT_SOLUTION}` cs
            WHERE cs.ID_CONTENT = c.ID_CONTENT
              AND cs.ID_SOLUTION IN UNNEST(@solution_ids)
        )
    )

    ORDER BY PUBLISHED_AT DESC
    LIMIT @limit
    OFFSET @offset
    """

    # ============================================================
    # EXECUTION
    # ============================================================

    return query_bq(
        sql,
        {
            "query": query,
            "topic_ids": topic_ids,
            "company_ids": company_ids,
            "solution_ids": solution_ids,
            "news_types": news_types,
            "limit": limit,
            "offset": offset,
        },
    )

# ============================================================
# META
# ============================================================

def get_feed_meta() -> Dict:

    sql = f"""
    -- =========================
    -- TOPICS
    -- =========================
    SELECT
        'topic' AS type,
        t.ID_TOPIC AS id,
        t.LABEL AS label,
        0 AS count
    FROM `{TABLE_TOPIC}` t
    WHERE t.LABEL IS NOT NULL

    UNION ALL

    -- =========================
    -- COMPANIES
    -- =========================
    SELECT
        'company' AS type,
        c.ID_COMPANY AS id,
        c.NAME AS label,
        0 AS count
    FROM `{TABLE_COMPANY}` c
    WHERE c.NAME IS NOT NULL

    UNION ALL

    -- =========================
    -- SOLUTIONS
    -- =========================
    SELECT
        'solution' AS type,
        s.ID_SOLUTION AS id,
        s.NAME AS label,
        0 AS count
    FROM `{TABLE_SOLUTION}` s
    WHERE s.NAME IS NOT NULL

    UNION ALL

    -- =========================
    -- NEWS TYPES (AVEC COUNT)
    -- =========================
    SELECT
        'news_type' AS type,
        n.NEWS_TYPE AS id,
        n.NEWS_TYPE AS label,
        COUNT(*) AS count
    FROM `{TABLE_NEWS}` n
    WHERE n.STATUS = 'PUBLISHED'
      AND n.NEWS_TYPE IS NOT NULL
    GROUP BY n.NEWS_TYPE

    ORDER BY type, label
    """

    rows = query_bq(sql)

    # ============================================================
    # FORMATAGE
    # ============================================================

    result = {
        "topics": [],
        "companies": [],
        "solutions": [],
        "news_types": []
    }

    for r in rows:
        if not r.get("id") or not r.get("label"):
            continue  # sécurité supplémentaire

        item = {
            "id": r["id"],
            "label": r["label"],
            "count": r.get("count", 0),
        }

        if r["type"] == "topic":
            result["topics"].append(item)

        elif r["type"] == "company":
            result["companies"].append(item)

        elif r["type"] == "solution":
            result["solutions"].append(item)

        elif r["type"] == "news_type":
            result["news_types"].append(item)

    return result
