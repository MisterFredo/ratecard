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

    # 🔒 NORMALISATION (ARRAY UNIQUEMENT)
    topic_ids = clean_array(topic_ids)
    company_ids = clean_array(company_ids)
    solution_ids = clean_array(solution_ids)
    types = clean_array(types)
    news_types = clean_array(news_types)

    sql = f"""
    WITH base AS (

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
    )

    SELECT *
    FROM base
    WHERE 1=1

    -- QUERY
    AND (
      @query IS NULL
      OR LOWER(TITLE) LIKE CONCAT('%', LOWER(@query), '%')
      OR LOWER(EXCERPT) LIKE CONCAT('%', LOWER(@query), '%')
    )

    -- TYPE
    AND (
      ARRAY_LENGTH(@types) = 0
      OR type IN UNNEST(@types)
    )

    -- NEWS TYPE
    AND (
      type != 'news'
      OR ARRAY_LENGTH(@news_types) = 0
      OR NEWS_TYPE IN UNNEST(@news_types)
    )

    -- COMPANY
    AND (
      ARRAY_LENGTH(@company_ids) = 0
      OR ID_COMPANY IN UNNEST(@company_ids)
      OR id IN (
        SELECT ID_CONTENT
        FROM `{TABLE_CONTENT_COMPANY}`
        WHERE ID_COMPANY IN UNNEST(@company_ids)
      )
    )

    -- TOPIC
    AND (
      ARRAY_LENGTH(@topic_ids) = 0
      OR id IN (
        SELECT ID_NEWS
        FROM `{TABLE_NEWS_TOPIC}`
        WHERE ID_TOPIC IN UNNEST(@topic_ids)
      )
      OR id IN (
        SELECT ID_CONTENT
        FROM `{TABLE_CONTENT_TOPIC}`
        WHERE ID_TOPIC IN UNNEST(@topic_ids)
      )
    )

    -- SOLUTION
    AND (
      ARRAY_LENGTH(@solution_ids) = 0
      OR id IN (
        SELECT ID_NEWS
        FROM `{TABLE_NEWS_SOLUTION}`
        WHERE ID_SOLUTION IN UNNEST(@solution_ids)
      )
      OR id IN (
        SELECT ID_CONTENT
        FROM `{TABLE_CONTENT_SOLUTION}`
        WHERE ID_SOLUTION IN UNNEST(@solution_ids)
      )
    )

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
# META (FILTRES)
# ============================================================

def get_feed_meta() -> Dict:

    sql = f"""
    -- ============================
    -- TOPICS
    -- ============================
    SELECT
        'topic' AS type,
        t.ID_TOPIC AS id,
        t.LABEL AS label,
        COUNT(*) AS count
    FROM `{TABLE_TOPIC}` t
    LEFT JOIN `{TABLE_CONTENT_TOPIC}` ct ON t.ID_TOPIC = ct.ID_TOPIC
    LEFT JOIN `{TABLE_NEWS_TOPIC}` nt ON t.ID_TOPIC = nt.ID_TOPIC
    WHERE ct.ID_CONTENT IS NOT NULL OR nt.ID_NEWS IS NOT NULL
    GROUP BY t.ID_TOPIC, t.LABEL

    UNION ALL

    -- ============================
    -- COMPANIES
    -- ============================
    SELECT
        'company' AS type,
        c.ID_COMPANY AS id,
        c.NAME AS label,
        COUNT(*) AS count
    FROM `{TABLE_COMPANY}` c
    LEFT JOIN `{TABLE_NEWS}` n ON c.ID_COMPANY = n.ID_COMPANY
    LEFT JOIN `{TABLE_CONTENT_COMPANY}` cc ON c.ID_COMPANY = cc.ID_COMPANY
    WHERE n.ID_NEWS IS NOT NULL OR cc.ID_CONTENT IS NOT NULL
    GROUP BY c.ID_COMPANY, c.NAME

    UNION ALL

    -- ============================
    -- SOLUTIONS
    -- ============================
    SELECT
        'solution' AS type,
        s.ID_SOLUTION AS id,
        s.NAME AS label,
        COUNT(*) AS count
    FROM `{TABLE_SOLUTION}` s
    LEFT JOIN `{TABLE_CONTENT_SOLUTION}` cs ON s.ID_SOLUTION = cs.ID_SOLUTION
    LEFT JOIN `{TABLE_NEWS_SOLUTION}` ns ON s.ID_SOLUTION = ns.ID_SOLUTION
    WHERE cs.ID_CONTENT IS NOT NULL OR ns.ID_NEWS IS NOT NULL
    GROUP BY s.ID_SOLUTION, s.NAME

    UNION ALL

    -- ============================
    -- NEWS TYPES
    -- ============================
    SELECT
        'news_type' AS type,
        NEWS_TYPE AS id,
        NEWS_TYPE AS label,
        COUNT(*) AS count
    FROM `{TABLE_NEWS}`
    WHERE STATUS = 'PUBLISHED'
    GROUP BY NEWS_TYPE
    """

    rows = query_bq(sql)

    result = {
        "topics": [],
        "companies": [],
        "solutions": [],
        "news_types": []
    }

    for r in rows:
        t = r["type"]  # pas de lower, on garde exact BQ

        if t == "topic":
            result["topics"].append({
                "id": r["id"],
                "label": r["label"],
                "count": r["count"],
            })

        elif t == "company":
            result["companies"].append({
                "id": r["id"],
                "label": r["label"],
                "count": r["count"],
            })

        elif t == "solution":
            result["solutions"].append({
                "id": r["id"],
                "label": r["label"],
                "count": r["count"],
            })

        elif t == "news_type":
            result["news_types"].append({
                "id": r["id"],
                "label": r["label"],
                "count": r["count"],
            })

    return result
