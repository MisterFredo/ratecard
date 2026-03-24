from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from core.search.service import search

router = APIRouter()


@router.get("/search")
def search_route(
    q: str = Query(..., description="Search query"),
    limit: int = 20,
    offset: int = 0,
    type: Optional[str] = Query(None, description="news | analysis"),
):
    try:
        results = search(
            q=q,
            limit=limit,
            offset=offset,
            type=type,  # 🔥 NEW
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(400, f"Erreur search : {e}")
