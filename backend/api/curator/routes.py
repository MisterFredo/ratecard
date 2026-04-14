from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional

from core.curator.service import (
    search,
    latest,
    get_item_curator,
    get_item_detail,
    get_content_stats,
)

# 🔥 JWT
from utils.auth import get_user_id_from_request

router = APIRouter()


# ============================================================
# HELPERS
# ============================================================

def get_universe_id(universe_id: Optional[str]) -> Optional[str]:
    return universe_id if universe_id else None


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
            universe_id=get_universe_id(universe_id),
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
    universe_id: Optional[str] = Query(None),
):
    try:
        user_id = require_user(request)

        items = latest(
            limit=limit,
            offset=offset,
            user_id=user_id,
            universe_id=get_universe_id(universe_id),
        )

        return {"items": items, "count": len(items)}

    except Exception as e:
        raise HTTPException(400, f"Latest error: {e}")


# ============================================================
# STATS (désactivé côté front mais sécurisé)
# ============================================================

@router.get("/stats")
def stats_route(request: Request):
    try:
        _ = require_user(request)  # 🔥 protection minimale

        stats = get_content_stats()
        return {"status": "ok", "stats": stats}

    except Exception as e:
        raise HTTPException(400, f"Stats error: {e}")


# ============================================================
# ITEM
# ============================================================

@router.get("/item/{item_id}")
def read_item(request: Request, item_id: str):

    user_id = require_user(request)

    item = get_item_curator(item_id, user_id=user_id)

    if not item:
        raise HTTPException(404, "Item not found")

    return item


# ============================================================
# DETAIL
# ============================================================

@router.get("/item/{item_id}/detail")
def read_item_detail(request: Request, item_id: str):

    user_id = require_user(request)

    item = get_item_detail(item_id, user_id=user_id)

    if not item:
        raise HTTPException(404, "Item not found")

    return item
