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

    query = query if query and query.strip() != "" else None

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

    AND (@query IS NULL OR SEARCH(n, @query))

    AND (@news_types IS NULL OR n.NEWS_TYPE IN UNNEST(@news_types))

    AND (@company_ids IS NULL OR n.ID_COMPANY IN UNNEST(@company_ids))

    AND (
        @topic_ids IS NULL
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_NEWS_TOPIC}` nt
            WHERE nt.ID_NEWS = n.ID_NEWS
              AND nt.ID_TOPIC IN UNNEST(@topic_ids)
        )
    )

    AND (
        @solution_ids IS NULL
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

    AND (@query IS NULL OR SEARCH(c, @query))

    AND (
        @company_ids IS NULL
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_CONTENT_COMPANY}` cc
            WHERE cc.ID_CONTENT = c.ID_CONTENT
              AND cc.ID_COMPANY IN UNNEST(@company_ids)
        )
    )

    AND (
        @topic_ids IS NULL
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_CONTENT_TOPIC}` ct
            WHERE ct.ID_CONTENT = c.ID_CONTENT
              AND ct.ID_TOPIC IN UNNEST(@topic_ids)
        )
    )

    AND (
        @solution_ids IS NULL
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
