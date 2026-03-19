from fastapi import APIRouter, HTTPException

from core.content.public_service import list_contents, get_content

router = APIRouter()


# ============================================================
# FEED
# ============================================================

@router.get("/content")
def get_feed(limit: int = 20, offset: int = 0):
    items = list_contents(limit=limit, offset=offset)
    return {"items": items}


# ============================================================
# DRAWER
# ============================================================

@router.get("/content/{id_content}")
def read_content(id_content: str):
    item = get_content(id_content)

    if not item:
        raise HTTPException(404, "Content not found")

    return item
