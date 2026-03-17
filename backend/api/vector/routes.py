from fastapi import APIRouter, HTTPException

from api.vector.models import VectorBatchRequest
from core.vectorization.vector_service import (
    vectorize_news,
    get_news_vector_status,
)

router = APIRouter()


# --------------------------------------------------
# VECTORIZE ONE NEWS
# --------------------------------------------------

@router.post("/news/{news_id}")
def vectorize_news_route(news_id: str):
    try:
        result = vectorize_news(news_id)
        print("VECTOR RESULT:", result)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("VECTOR ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# VECTORIZE MULTIPLE NEWS
# --------------------------------------------------

@router.post("/news/batch")
def vectorize_news_batch(payload: VectorBatchRequest):

    results = []

    for news_id in payload.ids:
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


# --------------------------------------------------
# STATUS
# --------------------------------------------------

@router.get("/news/status")
def news_status():
    try:
        return get_news_vector_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
