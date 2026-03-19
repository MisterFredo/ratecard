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

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"


# ============================================================
# HELPERS
# ============================================================

def clean_array(value):
    if value is None:
        return []

    if isinstance(value, list):
        return value

    if isinstance(value, str):
        if value.strip() == "":
            return []
        return [value]

    return [value]


# ============================================================
# FEED
# ============================================================

def get_news_items(
    query=None,
    topic_ids=None,
    company_ids=None,
    solution_ids=None,
    news_types=None,
    limit=20,
    offset=0,
):

    topic_ids = topic_ids or []
    company_ids = company_ids or []
    solution_ids = solution_ids or []
    news_types = news_types or []

    sql = f"""
    SELECT
        n.ID_NEWS as id,
        'news' as type,
        n.TITLE,
        n.EXCERPT,
        n.PUBLISHED_AT,
        n.NEWS_TYPE,
        n.ID_COMPANY
    FROM `{TABLE_NEWS}` n
    WHERE n.STATUS = 'PUBLISHED'

    AND (@query IS NULL OR SEARCH(n, @query))

    AND (
        ARRAY_LENGTH(@news_types) = 0
        OR n.NEWS_TYPE IN UNNEST(@news_types)
    )

    AND (
        ARRAY_LENGTH(@company_ids) = 0
        OR n.ID_COMPANY IN UNNEST(@company_ids)
    )

    AND (
        ARRAY_LENGTH(@topic_ids) = 0
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

    ORDER BY n.PUBLISHED_AT DESC
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
            "news_types": news_types,
            "limit": limit,
            "offset": offset,
        },
    )

    return {
        "items": [
            {
                "id": r["id"],
                "type": "news",
                "title": r["TITLE"],
                "excerpt": r["EXCERPT"],
                "published_at": r["PUBLISHED_AT"],
                "news_type": r["NEWS_TYPE"],
                "company_id": r["ID_COMPANY"],
            }
            for r in rows
        ],
        "count": len(rows),
    }

def get_feed_items(
    query: Optional[str] = None,
    topic_ids: Optional[List[str]] = None,
    company_ids: Optional[List[str]] = None,
    solution_ids: Optional[List[str]] = None,
    news_types: Optional[List[str]] = None,
    limit: int = 20,
    offset: int = 0,
) -> Dict:

    topic_ids = clean_array(topic_ids)
    company_ids = clean_array(company_ids)
    solution_ids = clean_array(solution_ids)
    news_types = clean_array(news_types)

    sql = f"""
    WITH base_news AS (

      SELECT
        n.ID_NEWS as id,
        'news' as type,
        n.TITLE,
        n.EXCERPT,
        n.PUBLISHED_AT,
        n.NEWS_TYPE,
        n.ID_COMPANY
      FROM `{TABLE_NEWS}` n
      WHERE n.STATUS = 'PUBLISHED'

      AND (@query IS NULL OR SEARCH(n, @query))

      AND (
        ARRAY_LENGTH(@news_types) = 0
        OR n.NEWS_TYPE IN UNNEST(@news_types)
      )

      AND (
        ARRAY_LENGTH(@company_ids) = 0
        OR n.ID_COMPANY IN UNNEST(@company_ids)
      )

      AND (
        ARRAY_LENGTH(@topic_ids) = 0
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
    ),

    base_content AS (

      SELECT
        c.ID_CONTENT as id,
        'analysis' as type,
        c.TITLE,
        c.EXCERPT,
        c.PUBLISHED_AT,
        NULL as NEWS_TYPE,
        NULL as ID_COMPANY
      FROM `{TABLE_CONTENT}` c
      WHERE c.STATUS = 'PUBLISHED'

      AND (@query IS NULL OR SEARCH(c, @query))

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
    )

    SELECT *
    FROM (
      SELECT * FROM base_news
      UNION ALL
      SELECT * FROM base_content
    )
    ORDER BY PUBLISHED_AT DESC
    LIMIT @limit
    OFFSET @offset
    """

    params = {
        "query": query if query else None,
        "topic_ids": topic_ids,
        "company_ids": company_ids,
        "solution_ids": solution_ids,
        "news_types": news_types,
        "limit": limit,
        "offset": offset,
    }

    rows = query_bq(sql, params=params)

    items = []
    for r in rows:
        items.append({
            "id": r["id"],
            "type": r["type"],
            "title": r.get("TITLE"),
            "excerpt": r.get("EXCERPT"),
            "published_at": r.get("PUBLISHED_AT"),
            "news_type": r.get("NEWS_TYPE"),
            "company_id": r.get("ID_COMPANY"),
        })

    return {
        "items": items,
        "count": len(items),
    }


# ============================================================
# META
# ============================================================

def get_feed_meta() -> Dict:

    sql = f"""
    SELECT *
    FROM (

        SELECT
            'topic' AS type,
            ID_TOPIC AS id,
            LABEL AS label,
            0 AS count
        FROM `{TABLE_TOPIC}`

        UNION ALL

        SELECT
            'company' AS type,
            ID_COMPANY AS id,
            NAME AS label,
            0 AS count
        FROM `{TABLE_COMPANY}`

        UNION ALL

        SELECT
            'solution' AS type,
            ID_SOLUTION AS id,
            NAME AS label,
            0 AS count
        FROM `{TABLE_SOLUTION}`

        UNION ALL

        SELECT
            'news_type' AS type,
            NEWS_TYPE AS id,
            NEWS_TYPE AS label,
            COUNT(*) AS count
        FROM `{TABLE_NEWS}`
        WHERE STATUS = 'PUBLISHED'
        GROUP BY NEWS_TYPE

    )
    ORDER BY type, label
    """

    rows = query_bq(sql)

    result = {
        "topics": [],
        "companies": [],
        "solutions": [],
        "news_types": []
    }

    for r in rows:
        item = {
            "id": r["id"],
            "label": r["label"],
            "count": r["count"],
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
