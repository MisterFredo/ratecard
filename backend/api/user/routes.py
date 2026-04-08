from fastapi import APIRouter, HTTPException

from api.user.models import (
    CreateUserPayload,
    AssignUniversePayload,
    LoginPayload,
)

from core.user.user_service import (
    get_user_context,
    create_user,
    assign_universes,
)

router = APIRouter()

# =========================================================
# CREATE USER
# =========================================================

@router.post("/create")
def create_user_route(payload: CreateUserPayload):
    try:
        user_id = create_user(payload)
        return {
            "status": "ok",
            "user_id": user_id,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# =========================================================
# ASSIGN UNIVERS
# =========================================================

@router.post("/assign-universes")
def assign_universes_route(payload: AssignUniversePayload):
    assign_universes(payload.user_id, payload.universes)

    return {
        "status": "ok",
        "assigned": payload.universes,
    }


# =========================================================
# GET CONTEXT (DEBUG)
# =========================================================

@router.get("/context")
def get_context(email: str):
    context = get_user_context(email)

    if not context:
        raise HTTPException(status_code=404, detail="User not found or inactive")

    return context

@router.post("/login")
def login(payload: LoginPayload):
    user = get_user_by_email(payload.email)

    if not user:
        raise HTTPException(401)

    if not verify_password(payload.password, user["PASSWORD_HASH"]):
        raise HTTPException(401)

    return {
        "status": "ok",
        "email": user["EMAIL"]
    }
