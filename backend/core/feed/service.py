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
# FEED CURATOR (MOTEUR PRINCIPAL)
# ============================================================

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

    # 🔒 NORMALISATION
    topic_ids = clean_array(topic_ids)
    company_ids = clean_array(company_ids)
    solution_ids = clean_array(solution_ids)
    types = clean_array(types)
    news_types = clean_array(news_types)

    # 🔒 ASSERT (anti bugs futurs)
    assert query is None or isinstance(query, str)
    assert topic_ids is None or isinstance(topic_ids, list)
    assert company_ids is None or isinstance(company_ids, list)
    assert solution_ids is None or isinstance(solution_ids, list)
    assert types is None or isinstance(types, list)
    assert news_types is None or isinstance(news_types, list)

    sql = f"""
    SELECT *
    FROM (

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

    WHERE 1=1

    -- QUERY
    AND (
      @query IS NULL
      OR LOWER(TITLE) LIKE CONCAT('%', LOWER(@query), '%')
      OR LOWER(EXCERPT) LIKE CONCAT('%', LOWER(@query), '%')
    )

    -- TYPE
    AND (
      @types IS NULL
      OR type IN UNNEST(@types)
    )

    -- NEWS TYPE
    AND (
      type != 'news'
      OR @news_types IS NULL
      OR NEWS_TYPE IN UNNEST(@news_types)
    )

    -- COMPANY
    AND (
      @company_ids IS NULL
      OR ID_COMPANY IN UNNEST(@company_ids)
      OR id IN (
        SELECT ID_CONTENT
        FROM `{TABLE_CONTENT_COMPANY}`
        WHERE ID_COMPANY IN UNNEST(@company_ids)
      )
    )

    -- TOPIC
    AND (
      @topic_ids IS NULL
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
      @solution_ids IS NULL
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
        'topic' as type,
        t.ID_TOPIC as id,
        t.LABEL as label,
        COUNT(*) as count
    FROM `{TABLE_TOPIC}` t
    LEFT JOIN `{TABLE_CONTENT_TOPIC}` ct ON t.ID_TOPIC = ct.ID_TOPIC
    LEFT JOIN `{TABLE_NEWS_TOPIC}` nt ON t.ID_TOPIC = nt.ID_TOPIC
    WHERE ct.ID_CONTENT IS NOT NULL OR nt.ID_NEWS IS NOT NULL
    GROUP BY id, label

    UNION ALL

    -- ============================
    -- COMPANIES
    -- ============================
    SELECT
        'company' as type,
        c.ID_COMPANY as id,
        c.NAME as label,
        COUNT(*) as count
    FROM `{TABLE_COMPANY}` c
    LEFT JOIN `{TABLE_NEWS}` n ON c.ID_COMPANY = n.ID_COMPANY
    LEFT JOIN `{TABLE_CONTENT_COMPANY}` cc ON c.ID_COMPANY = cc.ID_COMPANY
    WHERE n.ID_NEWS IS NOT NULL OR cc.ID_CONTENT IS NOT NULL
    GROUP BY id, label

    UNION ALL

    -- ============================
    -- SOLUTIONS
    -- ============================
    SELECT
        'solution' as type,
        s.ID_SOLUTION as id,
        s.NAME as label,
        COUNT(*) as count
    FROM `{TABLE_SOLUTION}` s
    LEFT JOIN `{TABLE_CONTENT_SOLUTION}` cs ON s.ID_SOLUTION = cs.ID_SOLUTION
    LEFT JOIN `{TABLE_NEWS_SOLUTION}` ns ON s.ID_SOLUTION = ns.ID_SOLUTION
    WHERE cs.ID_CONTENT IS NOT NULL OR ns.ID_NEWS IS NOT NULL
    GROUP BY id, label

    UNION ALL

    -- ============================
    -- NEWS TYPES
    -- ============================
    SELECT
        'news_type' as type,
        NEWS_TYPE as id,
        NEWS_TYPE as label,
        COUNT(*) as count
    FROM `{TABLE_NEWS}`
    WHERE STATUS = 'PUBLISHED'
    GROUP BY NEWS_TYPE
    """

    rows = query_bq(sql)

    # regroupement par type
    result = {
        "topics": [],
        "companies": [],
        "solutions": [],
        "news_types": []
    }

    for r in rows:
        if r["type"] == "topic":
            result["topics"].append(r)
        elif r["type"] == "company":
            result["companies"].append(r)
        elif r["type"] == "solution":
            result["solutions"].append(r)
        elif r["type"] == "news_type":
            result["news_types"].append(r)

    return result
