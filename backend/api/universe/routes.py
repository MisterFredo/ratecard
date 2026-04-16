from fastapi import APIRouter, HTTPException, Request

from api.universe.models import UniverseListOut, UniverseOut
from core.universe.service import (
    list_universes,
    list_universes_for_user,
    get_universe,
)

router = APIRouter()


# ============================================================
# LIST (ADMIN - GLOBAL)
# ============================================================

@router.get("/list", response_model=UniverseListOut)
def universe_list():
    universes = list_universes()

    return {
        "status": "ok",
        "universes": universes,
    }


# ============================================================
# LIST FOR USER (CURATOR)
# ============================================================

@router.get("/list-for-user", response_model=UniverseListOut)
def universe_list_for_user(request: Request):

    user_id = request.headers.get("x-user-id")

    if not user_id:
        raise HTTPException(401, "User ID missing")

    universes = list_universes_for_user(user_id)

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
