from fastapi import APIRouter, HTTPException

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
        return vectorize_news(news_id)
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


# --------------------------------------------------
# STATUS
# --------------------------------------------------

@router.get("/news/status")
def news_status():
    try:
        return get_news_vector_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
