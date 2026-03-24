from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from core.curator.service import (
    search,
    latest,
    get_item_curator,
    get_item_detail,
    get_content_stats,
)

router = APIRouter()


# ============================================================
# SEARCH
# ============================================================

@router.get("/search")
def search_route(
    q: str = Query(...),
    limit: int = Query(20),
    offset: int = Query(0),
    type: Optional[str] = Query(None),  # 🔥 NEW
):
    try:
        items = search(
            q=q,
            limit=limit,
            offset=offset,
            type=type,  # 🔥 NEW
        )
        return {"items": items, "count": len(items)}
    except Exception as e:
        raise HTTPException(400, f"Search error: {e}")


# ============================================================
# LATEST
# ============================================================

@router.get("/latest")
def latest_route(
    limit: int = Query(20),
    offset: int = Query(0),
    type: Optional[str] = Query(None),  # 🔥 NEW
):
    try:
        items = latest(
            limit=limit,
            offset=offset,
            type=type,  # 🔥 NEW
        )
        return {"items": items, "count": len(items)}
    except Exception as e:
        raise HTTPException(400, f"Latest error: {e}")


# ============================================================
# STATS
# ============================================================

@router.get("/stats")
def stats_route():
    try:
        stats = get_content_stats()
        return {"status": "ok", "stats": stats}
    except Exception:
        raise HTTPException(400, "Erreur stats content")


# ============================================================
# ITEM
# ============================================================

@router.get("/item/{item_id}")
def read_item(item_id: str):
    item = get_item_curator(item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    return item


# ============================================================
# DETAIL
# ============================================================

@router.get("/item/{item_id}/detail")
def read_item_detail(
    item_id: str,
    type: str = Query(...)
):
    item = get_item_detail(item_id, type)
    if not item:
        raise HTTPException(404, "Item not found")
    return item
