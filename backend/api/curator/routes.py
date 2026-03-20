from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from core.feed.service import search_curator, get_feed_meta

from core.news.service import get_news
from core.content.public_service import get_content

router = APIRouter(prefix="/curator", tags=["Curator"])


# ============================================================
# SEARCH (MOTEUR UNIQUE)
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
    try:
        items = search_curator(
            query=query,
            topic_ids=topic_ids,
            company_ids=company_ids,
            solution_ids=solution_ids,
            news_types=news_types,
            limit=limit,
            offset=offset,
        )

        return {
            "items": items,
            "count": len(items),  # simple pour l’instant
        }

    except Exception as e:
        raise HTTPException(400, f"Search error: {e}")


# ============================================================
# META (FILTRES)
# ============================================================

@router.get("/meta")
def get_meta_route():
    try:
        data = get_feed_meta()

        return {
            "topics": data.get("topics", []),
            "companies": data.get("companies", []),
            "solutions": data.get("solutions", []),
            "news_types": data.get("news_types", []),
        }

    except Exception as e:
        raise HTTPException(400, f"Meta error: {e}")


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

    except Exception as e:
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

    except Exception as e:
        raise HTTPException(400, f"Content error: {e}")
