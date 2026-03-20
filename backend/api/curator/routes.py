from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from core.search.service import search_curator
from core.feed.service import get_feed_meta
from core.news.service import get_news
from core.content.public_service import get_content

router = APIRouter()


# ============================================================
# SEARCH (UNIFIÉ)
# ============================================================

@router.get("/search")
def search_route(
    query: Optional[str] = None,

    topic_ids: Optional[List[str]] = Query(default=None),
    company_ids: Optional[List[str]] = Query(default=None),
    solution_ids: Optional[List[str]] = Query(default=None),
    news_types: Optional[List[str]] = Query(default=None),

    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    return search_curator(
        query=query,
        topic_ids=topic_ids,
        company_ids=company_ids,
        solution_ids=solution_ids,
        news_types=news_types,
        limit=limit,
        offset=offset,
    )


# ============================================================
# META (FILTRES)
# ============================================================

@router.get("/meta")
def get_meta_route():
    try:
        data = get_feed_meta()
        return {
            "status": "ok",
            **data
        }
    except Exception as e:
        raise HTTPException(400, f"Erreur meta feed : {e}")


# ============================================================
# DRAWER NEWS
# ============================================================

@router.get("/news/{id_news}")
def read_news(id_news: str):
    item = get_news(id_news)

    if not item:
        raise HTTPException(status_code=404, detail="News not found")

    return item


# ============================================================
# DRAWER CONTENT
# ============================================================

@router.get("/content/{id_content}")
def read_content(id_content: str):
    item = get_content(id_content)

    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    return item
