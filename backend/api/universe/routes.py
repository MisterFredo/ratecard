from fastapi import APIRouter, HTTPException, Request

from api.universe.models import UniverseListOut, UniverseOut
from core.universe.service import (
    list_universes,              # 🔥 on le garde (fallback/admin)
    list_universes_for_user,     # 🔥 nouvelle fonction
    get_universe,
)

router = APIRouter()


# ============================================================
# LIST
# ============================================================

@router.get("/list", response_model=UniverseListOut)
def universe_list(request: Request):

    user_id = request.cookies.get("curator_user_id")

    # 🔥 CAS NORMAL → user connecté
    if user_id:
        universes = list_universes_for_user(user_id)

    # 🔥 FALLBACK → admin / debug / pas de cookie
    else:
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

@router.get("/list-for-user")
def list_universes_for_user_route(request: Request):

    user_id = request.headers.get("x-user-id")

    if not user_id:
        raise HTTPException(401, "User ID missing")

    universes = list_universes_for_user(user_id)

    return {
        "status": "ok",
        "universes": universes
    }
