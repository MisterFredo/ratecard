from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional

from core.curator.service import (
    search,
    latest,
    get_item_curator,
    get_item_detail,
    get_content_stats,
)

# 🔐 AUTH
from utils.auth import get_user_id_from_request

router = APIRouter()


# ============================================================
# AUTH HELPER (SAFE)
# ============================================================

def require_user(request: Request) -> str:
    user_id = get_user_id_from_request(request)

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return user_id


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
    universe_id: Optional[str] = Query(None),
):
    try:
        user_id = require_user(request)

        items = search(
            q=q,
            limit=limit,
            offset=offset,
            user_id=user_id,
            universe_id=universe_id,
        )

        return {"items": items, "count": len(items)}

    except Exception as e:
        print(f"❌ Search error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")


# ============================================================
# LATEST
# ============================================================

@router.get("/latest")
def latest_route(
    request: Request,
    limit: int = Query(20),
    offset: int = Query(0),
    type: Optional[str] = Query(None),
    universe_id: Optional[str] = Query(None),
):
    try:
        user_id = require_user(request)

        items = latest(
            limit=limit,
            offset=offset,
            user_id=user_id,
            universe_id=universe_id,
        )

        return {"items": items, "count": len(items)}

    except Exception as e:
        print(f"❌ Latest error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")


# ============================================================
# STATS
# ============================================================

@router.get("/stats")
def stats_route(request: Request):
    try:
        _ = require_user(request)

        stats = get_content_stats()
        return {"status": "ok", "stats": stats}

    except Exception as e:
        print(f"❌ Stats error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")


# ============================================================
# ITEM
# ============================================================

@router.get("/item/{item_id}")
def read_item(request: Request, item_id: str):
    try:
        user_id = require_user(request)

        item = get_item_curator(item_id, user_id=user_id)

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        return item

    except Exception as e:
        print(f"❌ Item error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")


# ============================================================
# DETAIL
# ============================================================

@router.get("/item/{item_id}/detail")
def read_item_detail(request: Request, item_id: str):
    try:
        user_id = require_user(request)

        item = get_item_detail(item_id, user_id=user_id)

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        return item

    except Exception as e:
        print(f"❌ Detail error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")
