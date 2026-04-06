from fastapi import APIRouter, HTTPException

from api.universe.models import UniverseListOut, UniverseOut
from core.universe.service import list_universes, get_universe

router = APIRouter()


# ============================================================
# LIST
# ============================================================

@router.get("/list", response_model=UniverseListOut)
def universe_list():

    universes = list_universes()

    return {
        "status": "ok",
        "universes": universes,
    }


# ============================================================
# GET ONE
# ============================================================

@router.get("/{universe_id}", response_model=UniverseOut)
def universe_get(universe_id: str):

    u = get_universe(universe_id)

    if not u:
        raise HTTPException(404, "Universe not found")

    return u
