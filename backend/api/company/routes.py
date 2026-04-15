from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional

from api.company.models import CompanyCreate, CompanyUpdate, CompanyOut

from core.company.service import (
    create_company,
    list_companies,
    list_companies_for_user,
    list_company_types,
    get_company,
    update_company,
    delete_company,
)

from core.curator.entity_service import get_company_view

# 🔐 AUTH
from utils.auth import get_user_id_from_request

router = APIRouter()


# ============================================================
# AUTH HELPER (SAFE)
# ============================================================

def require_user(request: Request) -> str:
    user_id = get_user_id_from_request(request)

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return user_id


# ============================================================
# CREATE
# ============================================================

@router.post("/create")
def create_route(data: CompanyCreate):
    try:
        company_id = create_company(data)
        return {"status": "ok", "id_company": company_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création société : {e}")


# ============================================================
# LIST (ADMIN / GLOBAL)
# ============================================================

@router.get("/list")
def list_route():
    try:
        companies = list_companies()
        return {"status": "ok", "companies": companies}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste sociétés : {e}")


# ============================================================
# TYPES
# ============================================================

@router.get("/types")
def list_types_route():
    try:
        types = list_company_types()
        return {"status": "ok", "types": types}
    except Exception as e:
        raise HTTPException(400, f"Erreur récupération types sociétés : {e}")


# ============================================================
# CURATOR LIST (FILTER BY USER UNIVERS)
# ============================================================

@router.get("/list-curator")
def list_companies_curator(request: Request):
    try:
        user_id = require_user(request)

        companies = list_companies_for_user(user_id)

        return {
            "status": "ok",
            "companies": companies,
        }

    except Exception as e:
        print(f"❌ Companies curator error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal error"
        )


# ============================================================
# GET ONE
# ============================================================

@router.get("/{id_company}", response_model=CompanyOut)
def get_route(id_company: str):

    company = get_company(id_company)

    if not company:
        raise HTTPException(404, "Société introuvable")

    return company


# ============================================================
# VIEW (CURATOR)
# ============================================================

@router.get("/{id_company}/view")
def get_view_route(
    request: Request,
    id_company: str,
    limit: int = 20,
    offset: int = 0,
    universe_id: Optional[str] = Query(None),
):
    try:
        user_id = require_user(request)

        company = get_company_view(
            company_id=id_company,
            limit=limit,
            offset=offset,
            universe_id=universe_id if universe_id else None,
            user_id=user_id,  # 🔥 important si tu veux filtrer aussi ici
        )

        if not company:
            raise HTTPException(404, "Company introuvable")

        return company

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Company view error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal error"
        )


# ============================================================
# UPDATE
# ============================================================

@router.put("/update/{id_company}")
def update_route(id_company: str, data: CompanyUpdate):
    try:
        updated = update_company(id_company, data)

        if not updated:
            raise HTTPException(
                404,
                "Société introuvable ou aucune modification"
            )

        return {"status": "ok", "updated": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour société : {e}")


# ============================================================
# DELETE (SOFT)
# ============================================================

@router.delete("/{id_company}")
def delete_route(id_company: str):
    try:
        deleted = delete_company(id_company)

        if not deleted:
            raise HTTPException(404, "Société introuvable")

        return {"status": "ok", "deleted": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur suppression société : {e}")
