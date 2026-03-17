from fastapi import APIRouter
from utils.bigquery_utils import query_bq
from config import BQ_PROJECT, BQ_DATASET

from core.vectorization.vector_service import vectorize_news

router = APIRouter()
TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"


# --------------------------------------------------
# VECTORIZE ONE NEWS
# --------------------------------------------------

@router.post("/news/{news_id}")
def vectorize_news_route(news_id: str):
    try:
        result = vectorize_news(news_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# VECTORIZE MULTIPLE NEWS
# --------------------------------------------------

@router.post("/news/batch")
def vectorize_news_batch(news_ids: list[str]):
    results = []

    for news_id in news_ids:
        try:
            res = vectorize_news(news_id)
            results.append(res)
        except Exception as e:
            results.append({
                "news_id": news_id,
                "status": "error",
                "error": str(e)
            })

    return {
        "status": "done",
        "results": results
    }

@router.get("/news/status")
def get_news_vector_status():

    query = f"""
        SELECT
            ID_NEWS,
            TITLE,
            STATUS,
            IFNULL(IS_VECTORIZED, FALSE) AS IS_VECTORIZED,
            UPDATED_AT
        FROM `{TABLE_NEWS}`
        WHERE STATUS = "PUBLISHED"
        ORDER BY UPDATED_AT DESC
        LIMIT 200
    """

    rows = query_bq(query)

    return {
        "items": [
            {
                "id_news": r["ID_NEWS"],
                "title": r["TITLE"],
                "status": r["STATUS"],
                "is_vectorized": r["IS_VECTORIZED"],
                "updated_at": str(r["UPDATED_AT"]),
            }
            for r in rows
        ]
    }
