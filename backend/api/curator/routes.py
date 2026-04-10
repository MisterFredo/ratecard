from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq

from core.curator.service import (
    search,
    latest,
    get_item_curator,
    get_item_detail,
    get_content_stats,
)

router = APIRouter()


# ============================================================
# 🔥 RESOLVE USER
# ============================================================

def resolve_user_id(email: Optional[str]) -> Optional[str]:
    if not email:
        return None

    rows = query_bq(f"""
        SELECT ID_USER
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER`
        WHERE EMAIL = @email
        LIMIT 1
    """, {"email": email})

    return rows[0]["ID_USER"] if rows else None


# ============================================================
# SEARCH
# ============================================================

@router.get("/search")
def search_route(
    q: str = Query(...),
    limit: int = Query(20),
    offset: int = Query(0),
    type: Optional[str] = Query(None),
    email: Optional[str] = Query(None),  # 🔥 NEW
):
    try:
        user_id = resolve_user_id(email)

        items = search(
            q=q,
            limit=limit,
            offset=offset,
            type=type,
            user_id=user_id,  # ✅ FIX
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
    type: Optional[str] = Query(None),
    email: Optional[str] = Query(None),  # 🔥 NEW
):
    try:
        user_id = resolve_user_id(email)

        items = latest(
            limit=limit,
            offset=offset,
            type=type,
            user_id=user_id,  # ✅ FIX
        )

        return {"items": items, "count": len(items)}

    except Exception as e:
        raise HTTPException(400, f"Latest error: {e}")


# ============================================================
# STATS
# ============================================================

@router.get("/stats")
def stats_route(
    email: Optional[str] = Query(None),  # 🔥 NEW
):
    try:
        user_id = resolve_user_id(email)

        stats = get_content_stats(user_id=user_id)  # ✅ FIX

        return {"status": "ok", "stats": stats}

    except Exception:
        raise HTTPException(400, "Erreur stats content")


# ============================================================
# ITEM
# ============================================================

@router.get("/item/{item_id}")
def read_item(
    item_id: str,
    email: Optional[str] = Query(None),  # 🔥 NEW
):
    user_id = resolve_user_id(email)

    item = get_item_curator(item_id, user_id=user_id)  # ✅ FIX

    if not item:
        raise HTTPException(404, "Item not found")

    return item


# ============================================================
# DETAIL
# ============================================================

@router.get("/item/{item_id}/detail")
def read_item_detail(
    item_id: str,
    type: str = Query(...),
    email: Optional[str] = Query(None),  # 🔥 NEW
):
    user_id = resolve_user_id(email)

    item = get_item_detail(item_id, type, user_id=user_id)  # ✅ FIX

    if not item:
        raise HTTPException(404, "Item not found")

    return item
