# backend/api/company/routes.py

from fastapi import APIRouter, HTTPException
from api.company.models import CompanyCreate
from core.company.service import (
    create_company,
    list_companies,
    get_company,
    update_company
)

router = APIRouter()


# ------------------------------------------------------------
# CREATE
# ------------------------------------------------------------
@router.post("/create")
def create_route(data: CompanyCreate):
    """
    Crée une société avec son nom, description,
    médias (rectangle / square), et liens externes.
    """
    try:
        company_id = create_company(data)
        return {"status": "ok", "id_company": company_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création société : {e}")


# ------------------------------------------------------------
# LIST
# ------------------------------------------------------------
@router.get("/list")
def list_route():
    """
    Retourne toutes les sociétés actives.
    """
    try:
        companies = list_companies()
        return {"status": "ok", "companies": companies}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste sociétés : {e}")


# ------------------------------------------------------------
# GET ONE
# ------------------------------------------------------------
@router.get("/{id_company}")
def get_route(id_company: str):
    """
    Récupère une société par ID.
    """
    company = get_company(id_company)
    if not company:
        raise HTTPException(404, "Société introuvable")
    return {"status": "ok", "company": company}


# ------------------------------------------------------------
# UPDATE
# ------------------------------------------------------------
@router.put("/update/{id_company}")
def update_route(id_company: str, data: CompanyCreate):
    """
    Met à jour une société + rattachements média.
    """
    try:
        updated = update_company(id_company, data)
        return {"status": "ok", "updated": updated}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour société : {e}")
