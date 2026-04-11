from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Dict, Optional

from api.company.models import CompanyCreate, CompanyUpdate, CompanyOut
from core.company.service import (
    create_company,
    list_companies,
    get_company,
    update_company,
    delete_company,
    list_company_types,
    list_companies_for_user,
)

from core.curator.entity_service import get_company_view

router = APIRouter()


# CREATE
@router.post("/create")
def create_route(data: CompanyCreate):
    try:
        company_id = create_company(data)
        return {"status": "ok", "id_company": company_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création société : {e}")


# LIST
@router.get("/list")
def list_route():
    try:
        companies = list_companies()
        return {"status": "ok", "companies": companies}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste sociétés : {e}")


# TYPES
@router.get("/types")
def list_types_route():
    try:
        types = list_company_types()
        return {"status": "ok", "types": types}
    except Exception as e:
        raise HTTPException(400, f"Erreur récupération types sociétés : {e}")

@router.get("/list-curator")
def list_companies_curator(
    request: Request,
    universe_id: Optional[str] = Query(None),  # ✅ NEW
):
    try:
        user_id = request.cookies.get("curator_user_id")

        companies = list_companies_for_user(
            user_id=user_id,
            universe_id=universe_id if universe_id else None,  # ✅ FIX
        )

        return {
            "status": "ok",
            "companies": companies,
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur liste sociétés curator : {e}")


# GET ONE
@router.get("/{id_company}", response_model=CompanyOut)
def get_route(id_company: str):

    company = get_company(id_company)

    if not company:
        raise HTTPException(404, "Société introuvable")

    return company

@router.get("/{id_company}/view")
def get_view_route(
    id_company: str,
    limit: int = 20,
    offset: int = 0
):
    try:
        company = get_company_view(
            id_company,
            limit=limit,
            offset=offset
        )

        if not company:
            raise HTTPException(404, "Company introuvable")

        return company

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur récupération company view : {e}"
        )


# UPDATE
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


# DELETE (soft)
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



