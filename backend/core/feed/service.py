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

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


def get_feed_items(
    query: Optional[str] = None,
    topic_ids: Optional[List[str]] = None,
    company_ids: Optional[List[str]] = None,
    solution_ids: Optional[List[str]] = None,
    types: Optional[List[str]] = None,         # ["news"], ["analysis"], ["news","analysis"]
    news_types: Optional[List[str]] = None,    # ["PRODUCT", "CORPORATE", ...]
    limit: int = 20,
    offset: int = 0,
) -> Dict:

    topic_ids = topic_ids or []
    company_ids = company_ids or []
    solution_ids = solution_ids or []
    types = types or []
    news_types = news_types or []

    sql = f"""
    WITH unified AS (

        -- ============================
        -- NEWS
        -- ============================
        SELECT
            n.ID_NEWS as id,
            'news' as type,
            n.TITLE,
            n.EXCERPT,
            n.PUBLISHED_AT,
            n.ID_COMPANY,
            c.NAME as company_name,
            n.MEDIA_RECTANGLE_ID,
            n.HAS_VISUAL,
            n.NEWS_TYPE
        FROM {TABLE_NEWS} n
        LEFT JOIN {TABLE_COMPANY} c
            ON n.ID_COMPANY = c.ID_COMPANY
        WHERE
            n.STATUS = 'PUBLISHED'
            AND n.IS_ACTIVE = TRUE

            -- TYPE FILTER (global)
            AND (
                ARRAY_LENGTH(@types) = 0
                OR 'news' IN UNNEST(@types)
            )

            -- SEARCH
            AND (
                @query IS NULL
                OR SEARCH(n, @query)
            )

            -- COMPANY FILTER
            AND (
                ARRAY_LENGTH(@company_ids) = 0
                OR n.ID_COMPANY IN UNNEST(@company_ids)
            )

            -- TOPIC FILTER
            AND (
                ARRAY_LENGTH(@topic_ids) = 0
                OR EXISTS (
                    SELECT 1
                    FROM {TABLE_NEWS_TOPIC} nt
                    WHERE nt.ID_NEWS = n.ID_NEWS
                      AND nt.ID_TOPIC IN UNNEST(@topic_ids)
                )
            )

            -- SOLUTION FILTER
            AND (
                ARRAY_LENGTH(@solution_ids) = 0
                OR EXISTS (
                    SELECT 1
                    FROM {TABLE_NEWS_SOLUTION} ns
                    WHERE ns.ID_NEWS = n.ID_NEWS
                      AND ns.ID_SOLUTION IN UNNEST(@solution_ids)
                )
            )

            -- NEWS_TYPE FILTER
            AND (
                ARRAY_LENGTH(@news_types) = 0
                OR n.NEWS_TYPE IN UNNEST(@news_types)
            )


        UNION ALL


        -- ============================
        -- ANALYSES
        -- ============================
        SELECT
            c.ID_CONTENT as id,
            'analysis' as type,
            c.TITLE,
            c.EXCERPT,
            c.PUBLISHED_AT,
            NULL as ID_COMPANY,
            NULL as company_name,
            NULL as MEDIA_RECTANGLE_ID,
            FALSE as HAS_VISUAL,
            NULL as NEWS_TYPE
        FROM {TABLE_CONTENT} c
        WHERE
            c.STATUS = 'PUBLISHED'
            AND c.IS_ACTIVE = TRUE

            -- TYPE FILTER
            AND (
                ARRAY_LENGTH(@types) = 0
                OR 'analysis' IN UNNEST(@types)
            )

            -- SEARCH
            AND (
                @query IS NULL
                OR SEARCH(c, @query)
            )

            -- COMPANY FILTER
            AND (
                ARRAY_LENGTH(@company_ids) = 0
                OR EXISTS (
                    SELECT 1
                    FROM {TABLE_CONTENT_COMPANY} cc
                    WHERE cc.ID_CONTENT = c.ID_CONTENT
                      AND cc.ID_COMPANY IN UNNEST(@company_ids)
                )
            )

            -- TOPIC FILTER
            AND (
                ARRAY_LENGTH(@topic_ids) = 0
                OR EXISTS (
                    SELECT 1
                    FROM {TABLE_CONTENT_TOPIC} ct
                    WHERE ct.ID_CONTENT = c.ID_CONTENT
                      AND ct.ID_TOPIC IN UNNEST(@topic_ids)
                )
            )

            -- SOLUTION FILTER
            AND (
                ARRAY_LENGTH(@solution_ids) = 0
                OR EXISTS (
                    SELECT 1
                    FROM {TABLE_CONTENT_SOLUTION} cs
                    WHERE cs.ID_CONTENT = c.ID_CONTENT
                      AND cs.ID_SOLUTION IN UNNEST(@solution_ids)
                )
            )

    )

    SELECT *
    FROM unified
    ORDER BY PUBLISHED_AT DESC
    LIMIT @limit
    OFFSET @offset
    """

    rows = query_bq(
        sql,
        {
            "query": query,
            "topic_ids": topic_ids,
            "company_ids": company_ids,
            "solution_ids": solution_ids,
            "types": types,
            "news_types": news_types,
            "limit": limit,
            "offset": offset,
        },
    )

    items = []

    for r in rows:
        items.append({
            "id": r["id"],
            "type": r["type"],
            "title": r["TITLE"],
            "excerpt": r.get("EXCERPT"),
            "published_at": r["PUBLISHED_AT"],
            "company": r.get("company_name"),
            "has_visual": r.get("HAS_VISUAL"),
            "media_id": r.get("MEDIA_RECTANGLE_ID"),
            "news_type": r.get("NEWS_TYPE"),
        })

    return {
        "items": items,
        "count": len(items),
    }
