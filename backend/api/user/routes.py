from fastapi import APIRouter, HTTPException

from api.user.models import (
    CreateUserPayload,
    AssignUniversePayload,
    LoginPayload,
    CreateUserPayload,
)

from core.user.user_service import (
    get_user_context,
    create_user,
    assign_universes,
    list_users,
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

@router.get("/list")
def list_users_route():
    users = list_users()

    return {
        "users": users
    }


@router.post("/update")
def update_user_route(payload: UpdateUserPayload):
    update_user(payload)
    return {"status": "ok"}


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

@router.get("/{user_id}")
def get_user(user_id: str):
    return {
        "user": get_user_by_id(user_id),
        "universes": get_user_universes(user_id),
    }
