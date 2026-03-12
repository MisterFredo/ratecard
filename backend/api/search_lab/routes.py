from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from utils.bigquery_utils import query_bq

router = APIRouter()


# SEARCH LAB
@router.get("/search-lab")
def search_lab(
    q: str = Query(..., description="Search query"),
    limit: int = 20
):
    try:
        sql = """
        -- NEWS
        SELECT
            ID_NEWS as ID,
            TITLE,
            EXCERPT,
            'NEWS' as SOURCE_TYPE,
            PUBLISHED_AT
        FROM `PROJECT.DATASET.RATECARD_NEWS`
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
        FROM `PROJECT.DATASET.RATECARD_CONTENT`
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

        results = query_bq(sql, {
            "query": q,
            "limit": limit
        })

        return {"results": results}

    except Exception as e:
        raise HTTPException(400, f"Erreur Search Lab : {e}")
