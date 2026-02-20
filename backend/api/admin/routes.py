from fastapi import APIRouter, HTTPException, Response
from core.digest.service import search_digest
from core.digest.template_service import (
    create_template,
    list_templates,
    get_template,
    update_template,
    delete_template,
)

router = APIRouter()

ADMIN_EMAIL = "mister.fredo@gmail.com"

@router.post("/login")
def admin_login(payload: dict, response: Response):
    email = payload.get("email")

    if email != ADMIN_EMAIL:
        raise HTTPException(401, "Unauthorized")

    response.set_cookie(
        key="ratecard_admin_session",
        value="ok",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
        path="/",
    )

    return {"status": "ok"}


@router.post("/logout")
def admin_logout(response: Response):
    response.delete_cookie(
        key="ratecard_admin_session",
        path="/",
    )
    return {"status": "ok"}

# ============================================================
# DIGEST SEARCH
# ============================================================

@router.post("/digest/search")
def admin_digest_search(payload: dict):

    return search_digest(
        topics=payload.get("topics"),
        companies=payload.get("companies"),
        news_types=payload.get("news_types"),
        period_days=payload.get("period_days"),
    )

# ============================================================
# DIGEST TEMPLATES
# ============================================================

@router.get("/digest/template")
def admin_list_templates():
    return list_templates()


@router.get("/digest/template/{template_id}")
def admin_get_template(template_id: str):
    tpl = get_template(template_id)
    if not tpl:
        raise HTTPException(404, "Template introuvable")
    return tpl


@router.post("/digest/template")
def admin_create_template(payload: dict):
    template_id = create_template(payload)
    return {"id_template": template_id}


@router.put("/digest/template/{template_id}")
def admin_update_template(template_id: str, payload: dict):
    update_template(template_id, payload)
    return {"status": "ok"}


@router.delete("/digest/template/{template_id}")
def admin_delete_template(template_id: str):
    delete_template(template_id)
    return {"status": "deleted"}
