from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# TABLES
# ============================================================

TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"


# ============================================================
# SEARCH (NEWS + ANALYSES)
# ============================================================

def search(q: str, limit: int = 20) -> List[Dict]:
    """
    Recherche full-text sur NEWS + ANALYSES
    via BigQuery Search Index.

    ⚠️ Repose sur des SEARCH INDEX créés sur :
    - RATECARD_NEWS
    - RATECARD_CONTENT
    """

    sql = f"""
    -- NEWS
    SELECT
        n.ID_NEWS as ID,
        n.TITLE,
        n.EXCERPT,
        'NEWS' as SOURCE_TYPE,
        n.PUBLISHED_AT
    FROM `{TABLE_NEWS}` n
    WHERE n.STATUS = 'PUBLISHED'
      AND SEARCH(n, @query)

    UNION ALL

    -- ANALYSES
    SELECT
        c.ID_CONTENT as ID,
        c.TITLE,
        c.EXCERPT,
        'ANALYSIS' as SOURCE_TYPE,
        c.PUBLISHED_AT
    FROM `{TABLE_CONTENT}` c
    WHERE c.STATUS = 'PUBLISHED'
      AND SEARCH(c, @query)

    ORDER BY PUBLISHED_AT DESC
    LIMIT @limit
    """

    return query_bq(
        sql,
        {
            "query": q,
            "limit": limit,
        }
    )
