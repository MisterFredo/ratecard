from fastapi import APIRouter, HTTPException, Query

from core.curator.service import (
    search,
    get_item_curator,
    get_item_detail,
)

router = APIRouter()


# ============================================================
# SEARCH (GOOGLE-LIKE)
# ============================================================

@router.get("/search")
def search_route(
    q: str = Query(..., description="Search query"),
    limit: int = Query(20, description="Max results")
):
    try:
        items = search(q=q, limit=limit)

        return {
            "items": items,
            "query": q,
            "count": len(items)
        }

    except Exception as e:
        raise HTTPException(400, f"Search error: {e}")


# ============================================================
# ITEM (LIGHT — FEED)
# ============================================================

@router.get("/item/{item_id}")
def read_item(item_id: str):
    try:
        item = get_item_curator(item_id)

        if not item:
            raise HTTPException(404, "Item not found")

        return item

    except HTTPException:
        raise
    except Exception as e:
        print("❌ ITEM ERROR:", e)
        raise HTTPException(400, f"Item error: {e}")


# ============================================================
# ITEM DETAIL (DRAWER COMPLET)
# ============================================================

@router.get("/item/{item_id}/detail")
def read_item_detail(
    item_id: str,
    type: str = Query(..., description="news | analysis")
):
    try:
        item = get_item_detail(item_id, type)

        if not item:
            raise HTTPException(404, "Item not found")

        return item

    except HTTPException:
        raise
    except Exception as e:
        print("❌ DETAIL ERROR:", e)
        raise HTTPException(400, f"Detail error: {e}")
