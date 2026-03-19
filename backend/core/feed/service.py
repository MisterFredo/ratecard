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
# FEED CURATOR (MOTEUR PRINCIPAL)
# ============================================================

def clean_array(v):
    if not v:
        return None
    if isinstance(v, list):
        return v
    return [v]


params = {
    "query": query,
    "topic_ids": clean_array(topic_ids),
    "company_ids": clean_array(company_ids),
    "solution_ids": clean_array(solution_ids),
    "types": clean_array(types),
    "news_types": clean_array(news_types),
    "limit": limit,
    "offset": offset,
}

def get_feed_items(
    query: Optional[str] = None,
    topic_ids: Optional[List[str]] = None,
    company_ids: Optional[List[str]] = None,
    solution_ids: Optional[List[str]] = None,
    types: Optional[List[str]] = None,
    news_types: Optional[List[str]] = None,
    limit: int = 20,
    offset: int = 0,
) -> Dict:

    sql = f"""
    WITH

    params AS (
      SELECT
        @types AS types,
        @news_types AS news_types,
        @topic_ids AS topic_ids,
        @company_ids AS company_ids,
        @solution_ids AS solution_ids,
        @query AS query
    ),

    base AS (

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

      UNION ALL

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
    ),

    filtered AS (
      SELECT *
      FROM base, params
      WHERE

        -- TYPE
        (params.types IS NULL OR type IN UNNEST(params.types))

        -- NEWS TYPE
        AND (
          type != 'news'
          OR params.news_types IS NULL
          OR NEWS_TYPE IN UNNEST(params.news_types)
        )

        -- QUERY
        AND (
          params.query IS NULL
          OR LOWER(TITLE) LIKE '%' || LOWER(params.query) || '%'
          OR LOWER(EXCERPT) LIKE '%' || LOWER(params.query) || '%'
        )

        -- COMPANY
        AND (
          params.company_ids IS NULL
          OR ID_COMPANY IN UNNEST(params.company_ids)
          OR id IN (
            SELECT ID_CONTENT
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY`
            WHERE ID_COMPANY IN UNNEST(params.company_ids)
          )
        )

        -- TOPIC
        AND (
          params.topic_ids IS NULL
          OR id IN (
            SELECT ID_NEWS
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_TOPIC`
            WHERE ID_TOPIC IN UNNEST(params.topic_ids)
          )
          OR id IN (
            SELECT ID_CONTENT
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC`
            WHERE ID_TOPIC IN UNNEST(params.topic_ids)
          )
        )

        -- SOLUTION
        AND (
          params.solution_ids IS NULL
          OR id IN (
            SELECT ID_NEWS
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_SOLUTION`
            WHERE ID_SOLUTION IN UNNEST(params.solution_ids)
          )
          OR id IN (
            SELECT ID_CONTENT
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_SOLUTION`
            WHERE ID_SOLUTION IN UNNEST(params.solution_ids)
          )
        )
    )

    SELECT *
    FROM filtered
    ORDER BY PUBLISHED_AT DESC
    LIMIT @limit
    OFFSET @offset
    """

    rows = query_bq(
        sql,
        params={
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

    # ============================================================
    # MAPPING FRONT
    # ============================================================

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
        "total": len(items),  # simple pour l’instant
    }

def get_feed_meta() -> Dict:

    sql = f"""
    -- ============================
    -- NEWS TYPES
    -- ============================
    SELECT DISTINCT
        'news_type' as type,
        NEWS_TYPE as value,
        NEWS_TYPE as label
    FROM {TABLE_NEWS}
    WHERE STATUS = 'PUBLISHED'
      AND NEWS_TYPE IS NOT NULL

    UNION ALL

    -- ============================
    -- COMPANIES (NEWS + CONTENT)
    -- ============================
    SELECT DISTINCT
        'company' as type,
        c.ID_COMPANY as value,
        c.NAME as label
    FROM {TABLE_COMPANY} c
    WHERE c.ID_COMPANY IN (
        SELECT ID_COMPANY FROM {TABLE_NEWS}
        WHERE STATUS = 'PUBLISHED'

        UNION DISTINCT

        SELECT ID_COMPANY FROM {TABLE_CONTENT_COMPANY}
    )

    UNION ALL

    -- ============================
    -- TOPICS (NEWS + CONTENT)
    -- ============================
    SELECT DISTINCT
        'topic' as type,
        t.ID_TOPIC as value,
        t.LABEL as label
    FROM {TABLE_TOPIC} t
    WHERE t.ID_TOPIC IN (
        SELECT ID_TOPIC FROM {TABLE_NEWS_TOPIC}

        UNION DISTINCT

        SELECT ID_TOPIC FROM {TABLE_CONTENT_TOPIC}
    )

    UNION ALL

    -- ============================
    -- SOLUTIONS (NEWS + CONTENT)
    -- ============================
    SELECT DISTINCT
        'solution' as type,
        s.ID_SOLUTION as value,
        s.NAME as label
    FROM {TABLE_SOLUTION} s
    WHERE s.ID_SOLUTION IN (
        SELECT ID_SOLUTION FROM {TABLE_NEWS_SOLUTION}

        UNION DISTINCT

        SELECT ID_SOLUTION FROM {TABLE_CONTENT_SOLUTION}
    )
    """

    rows = query_bq(sql)

    return {
        "items": rows
    }
