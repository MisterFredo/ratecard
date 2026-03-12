from fastapi import APIRouter, HTTPException, Query

from core.search.service import search

router = APIRouter()


@router.get("/search")
def search_route(
    q: str = Query(..., description="Search query"),
    limit: int = 20
):
    try:
        results = search(q=q, limit=limit)
        return {"results": results}
    except Exception as e:
        raise HTTPException(400, f"Erreur search : {e}")
