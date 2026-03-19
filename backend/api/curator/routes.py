from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from core.feed.service import get_feed_items, get_feed_meta
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

    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
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
# META (FILTRES COCKPIT)
# ============================================================

@router.get("/feed/meta")
def get_meta_route():
    return get_feed_meta()


# ============================================================
# DRAWER ANALYSIS
# ============================================================

@router.get("/content/{id_content}")
def read_content(id_content: str):
    item = get_content(id_content)

    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    return item
