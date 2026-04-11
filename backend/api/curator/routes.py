from fastapi import APIRouter, HTTPException, Query, Request
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
# HELPERS
# ============================================================

def get_user_id(request: Request) -> Optional[str]:
    return request.cookies.get("curator_user_id")


def get_universe_id(universe_id: Optional[str]) -> Optional[str]:
    return universe_id if universe_id else None


# ============================================================
# SEARCH
# ============================================================

@router.get("/search")
def search_route(
    request: Request,
    q: str = Query(...),
    limit: int = Query(20),
    offset: int = Query(0),
    type: Optional[str] = Query(None),
    universe_id: Optional[str] = Query(None),  # ✅ NEW
):
    try:
        user_id = get_user_id(request)

        items = search(
            q=q,
            limit=limit,
            offset=offset,
            type=type,
            user_id=user_id,
            universe_id=get_universe_id(universe_id),  # ✅ FIX
        )

        return {"items": items, "count": len(items)}

    except Exception as e:
        raise HTTPException(400, f"Search error: {e}")


# ============================================================
# LATEST
# ============================================================

@router.get("/latest")
def latest_route(
    request: Request,
    limit: int = Query(20),
    offset: int = Query(0),
    type: Optional[str] = Query(None),
    universe_id: Optional[str] = Query(None),  # ✅ NEW
):
    try:
        user_id = get_user_id(request)

        items = latest(
            limit=limit,
            offset=offset,
            type=type,
            user_id=user_id,
            universe_id=get_universe_id(universe_id),  # ✅ FIX
        )

        return {"items": items, "count": len(items)}

    except Exception as e:
        raise HTTPException(400, f"Latest error: {e}")


# ============================================================
# STATS
# ============================================================

@router.get("/stats")
def stats_route(
    request: Request,
    universe_id: Optional[str] = Query(None),  # ✅ NEW
):
    try:
        user_id = get_user_id(request)

        stats = get_content_stats(
            user_id=user_id,
            universe_id=get_universe_id(universe_id),  # ✅ FIX
        )

        return {"status": "ok", "stats": stats}

    except Exception as e:
        raise HTTPException(400, f"Stats error: {e}")


# ============================================================
# ITEM (PAS BESOIN D’UNIVERSE)
# ============================================================

@router.get("/item/{item_id}")
def read_item(request: Request, item_id: str):
    user_id = get_user_id(request)

    item = get_item_curator(item_id, user_id=user_id)

    if not item:
        raise HTTPException(404, "Item not found")

    return item


# ============================================================
# DETAIL (PAS BESOIN D’UNIVERSE)
# ============================================================

@router.get("/item/{item_id}/detail")
def read_item_detail(
    request: Request,
    item_id: str,
    type: str = Query(...)
):
    user_id = get_user_id(request)

    item = get_item_detail(item_id, type, user_id=user_id)

    if not item:
        raise HTTPException(404, "Item not found")

    return item
