from fastapi import APIRouter, HTTPException

from api.vector.models import (
    VectorBatchRequest,
    VectorBatchResponse,
    VectorBatchItem,
)

# ==================================================
# SERVICES
# ==================================================

# NEWS
from core.vectorization.vector_service import (
    vectorize_news,
    get_news_vector_status,
)

# CONTENT (analyses)
from core.vectorization.content_vector_service import (
    vectorize_content,
    get_content_vector_status,
)

router = APIRouter()


# ==================================================
# NEWS
# ==================================================

# --------------------------------------------------
# VECTORIZE ONE NEWS
# --------------------------------------------------

@router.post("/news/{news_id}")
def vectorize_news_route(news_id: str):
    try:
        result = vectorize_news(news_id)
        print("VECTOR NEWS RESULT:", result)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("VECTOR NEWS ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# VECTORIZE MULTIPLE NEWS
# --------------------------------------------------

@router.post("/news/batch", response_model=VectorBatchResponse)
def vectorize_news_batch(payload: VectorBatchRequest):

    results = []

    for news_id in payload.ids:
        try:
            res = vectorize_news(news_id)

            results.append(
                VectorBatchItem(
                    id=news_id,
                    status=res.get("status", "ok"),
                )
            )

        except Exception as e:
            results.append(
                VectorBatchItem(
                    id=news_id,
                    status="error",
                    error=str(e),
                )
            )

    return VectorBatchResponse(
        status="done",
        results=results
    )


# --------------------------------------------------
# STATUS NEWS
# --------------------------------------------------

@router.get("/news/status")
def news_status():
    try:
        return get_news_vector_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================================================
# CONTENT (ANALYSES)
# ==================================================

# --------------------------------------------------
# VECTORIZE ONE CONTENT
# --------------------------------------------------

@router.post("/content/{content_id}")
def vectorize_content_route(content_id: str):
    try:
        result = vectorize_content(content_id)
        print("VECTOR CONTENT RESULT:", result)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("VECTOR CONTENT ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# VECTORIZE MULTIPLE CONTENT
# --------------------------------------------------

@router.post("/content/batch", response_model=VectorBatchResponse)
def vectorize_content_batch(payload: VectorBatchRequest):

    results = []

    for content_id in payload.ids:
        try:
            res = vectorize_content(content_id)

            results.append(
                VectorBatchItem(
                    id=content_id,
                    status=res.get("status", "ok"),
                )
            )

        except Exception as e:
            results.append(
                VectorBatchItem(
                    id=content_id,
                    status="error",
                    error=str(e),
                )
            )

    return VectorBatchResponse(
        status="done",
        results=results
    )


# --------------------------------------------------
# STATUS CONTENT
# --------------------------------------------------

@router.get("/content/status")
def content_status():
    try:
        return get_content_vector_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
