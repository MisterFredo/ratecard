from utils.bigquery_utils import query_bq
from config import BQ_PROJECT, BQ_DATASET


# ============================================================
# TABLES
# ============================================================

TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"


# ============================================================
# SEARCH
# ============================================================

def search(q: str, limit: int = 20):

    sql = f"""
    -- NEWS
    SELECT
        ID_NEWS as ID,
        TITLE,
        EXCERPT,
        'NEWS' as SOURCE_TYPE,
        PUBLISHED_AT
    FROM `{TABLE_NEWS}`
    WHERE STATUS = 'PUBLISHED'
    AND SEARCH(TITLE, EXCERPT, BODY, @query)

    UNION ALL

    -- ANALYSES
    SELECT
        ID_CONTENT as ID,
        TITLE,
        EXCERPT,
        'ANALYSIS' as SOURCE_TYPE,
        PUBLISHED_AT
    FROM `{TABLE_CONTENT}`
    WHERE STATUS = 'PUBLISHED'
    AND SEARCH(
        TITLE,
        EXCERPT,
        CONTENT_BODY,
        MECANIQUE_EXPLIQUEE,
        ENJEU_STRATEGIQUE,
        POINT_DE_FRICTION,
        SIGNAL_ANALYTIQUE,
        @query
    )

    ORDER BY PUBLISHED_AT DESC
    LIMIT @limit
    """

    return query_bq(sql, {
        "query": q,
        "limit": limit
    })
