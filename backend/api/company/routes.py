# backend/api/company/routes.py

from fastapi import APIRouter, HTTPException

from api.company.models import CompanyCreate
from core.company.service import (
    create_company,
    list_companies,
    get_company
)

router = APIRouter()


@router.post("/create")
def create(data: CompanyCreate):
    try:
        company_id = create_company(data)
        return {"status": "ok", "id_company": company_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création client : {e}")


@router.get("/list")
def list_all():
    try:
        companies = list_companies()
        return {"status": "ok", "companies": companies}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste clients : {e}")


@router.get("/{id_company}")
def get_one(id_company: str):
    company = get_company(id_company)
    if not company:
        raise HTTPException(404, "Client introuvable")
    return {"status": "ok", "company": company}

@router.put("/update/{id_company}")
def update_company(id_company: str, data: CompanyCreate):
    from core.company.service import update_company
    try:
        result = update_company(id_company, data)
        return {"status": "ok", "updated": result}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour société : {e}")

