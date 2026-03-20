from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from core.curator.service import search
from core.news.service import get_news
from core.content.public_service import get_content

router = APIRouter()


# ============================================================
# SEARCH (FULL TEXT - IDENTIQUE ADMIN)
# ============================================================

@router.get("/search")
def search_route(
    q: str = Query(..., description="Search query"),
    limit: int = Query(20, description="Max results")
):
    try:
        results = search(q=q, limit=limit)
        return {
            "results": results,
            "query": q,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(400, f"Erreur search : {e}")


# ============================================================
# DRAWER NEWS
# ============================================================

@router.get("/news/{id_news}")
def read_news(id_news: str):
    try:
        item = get_news(id_news)

        if not item:
            raise HTTPException(404, "News not found")

        return item

    except HTTPException:
        raise
    except Exception as e:
        print("❌ NEWS ERROR:", e)
        raise HTTPException(400, f"News error: {e}")


# ============================================================
# DRAWER CONTENT
# ============================================================

@router.get("/content/{id_content}")
def read_content(id_content: str):
    try:
        item = get_content(id_content)

        if not item:
            raise HTTPException(404, "Content not found")

        return item

    except HTTPException:
        raise
    except Exception as e:
        print("❌ CONTENT ERROR:", e)
        raise HTTPException(400, f"Content error: {e}")
