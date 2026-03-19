from fastapi import APIRouter, HTTPException

from core.content.public_service import get_content
from core.feed.service import list_feed

router = APIRouter()


# ============================================================
# FEED (UNIFIÉ)
# ============================================================

@router.get("/feed")
def get_feed_route(limit: int = 20, offset: int = 0):
    return list_feed(limit=limit, offset=offset)


# ============================================================
# DRAWER (CONTENT)
# ============================================================

@router.get("/content/{id_content}")
def read_content(id_content: str):
    item = get_content(id_content)

    if not item:
        raise HTTPException(404, "Content not found")

    return item
