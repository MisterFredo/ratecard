from fastapi import APIRouter, HTTPException

from api.vector.models import (
    VectorBatchRequest,

    VectorNewsBatchResponse,
    VectorNewsBatchItem,

    VectorContentBatchResponse,
    VectorContentBatchItem,
)

# ==================================================
# SERVICES
# ==================================================

# NEWS
from core.vectorization.vector_service import (
    vectorize_news,
    get_news_vector_status,
    get_news_to_vectorize,   # 👈 à ajouter côté service
)

# CONTENT
from core.vectorization.content_vector_service import (
    vectorize_content,
    get_content_vector_status,
    get_content_to_vectorize,  # 👈 à ajouter côté service
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
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# VECTORIZE MULTIPLE NEWS
# --------------------------------------------------

@router.post("/news/batch", response_model=VectorNewsBatchResponse)
def vectorize_news_batch(payload: VectorBatchRequest):

    results = []
    success = 0
    error = 0

    try:
        # =========================
        # SOURCE DES IDS
        # =========================
        if payload.ids:
            news_ids = payload.ids

        else:
            news_ids = get_news_to_vectorize(
                limit=payload.limit,
                offset=payload.offset,
                status=payload.status,
            )

        # =========================
        # PROCESS
        # =========================
        for news_id in news_ids:
            try:
                res = vectorize_news(news_id)

                results.append(
                    VectorNewsBatchItem(
                        news_id=news_id,
                        status=res.get("status", "ok"),
                        nb_vectors=res.get("nb_vectors"),
                    )
                )

                success += 1

            except Exception as e:
                results.append(
                    VectorNewsBatchItem(
                        news_id=news_id,
                        status="error",
                        error=str(e),
                    )
                )
                error += 1

        return VectorNewsBatchResponse(
            status="done",
            processed=len(news_ids),
            success=success,
            error=error,
            results=results
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# STATUS NEWS
# --------------------------------------------------

@router.get("/news/status")
def news_status(limit: int = 50, offset: int = 0):
    try:
        return get_news_vector_status(limit=limit, offset=offset)
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
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# VECTORIZE MULTIPLE CONTENT
# --------------------------------------------------

@router.post("/content/batch", response_model=VectorContentBatchResponse)
def vectorize_content_batch(payload: VectorBatchRequest):

    results = []
    success = 0
    error = 0

    try:
        # =========================
        # SOURCE DES IDS
        # =========================
        if payload.ids:
            content_ids = payload.ids

        else:
            content_ids = get_content_to_vectorize(
                limit=payload.limit,
                offset=payload.offset,
                status=payload.status,
            )

        # =========================
        # PROCESS
        # =========================
        for content_id in content_ids:
            try:
                res = vectorize_content(content_id)

                results.append(
                    VectorContentBatchItem(
                        content_id=content_id,
                        status=res.get("status", "ok"),
                        nb_vectors=res.get("nb_vectors"),
                    )
                )

                success += 1

            except Exception as e:
                results.append(
                    VectorContentBatchItem(
                        content_id=content_id,
                        status="error",
                        error=str(e),
                    )
                )
                error += 1

        return VectorContentBatchResponse(
            status="done",
            processed=len(content_ids),
            success=success,
            error=error,
            results=results
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# STATUS CONTENT
# --------------------------------------------------

@router.get("/content/status")
def content_status():
    try:
        return get_content_vector_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
