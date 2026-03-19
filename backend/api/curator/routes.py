from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from core.feed.service import get_feed_items
from core.content.public_service import get_content

router = APIRouter()


# ============================================================
# FEED (MOTEUR CURATOR)
# ============================================================

@router.get("/feed")
def get_feed_route(
    query: Optional[str] = None,
    topic_ids: Optional[List[str]] = Query(default=None),
    company_ids: Optional[List[str]] = Query(default=None),
    solution_ids: Optional[List[str]] = Query(default=None),
    types: Optional[List[str]] = Query(default=None),
    news_types: Optional[List[str]] = Query(default=None),
    limit: int = 20,
    offset: int = 0,
):
    return get_feed_items(
        query=query,
        topic_ids=topic_ids,
        company_ids=company_ids,
        solution_ids=solution_ids,
        types=types,
        news_types=news_types,
        limit=limit,
        offset=offset,
    )


# ============================================================
# DRAWER ANALYSIS
# ============================================================

@router.get("/content/{id_content}")
def read_content(id_content: str):
    item = get_content(id_content)

    if not item:
        raise HTTPException(404, "Content not found")

    return item
