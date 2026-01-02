from fastapi import APIRouter, HTTPException
from api.company.models import (
    CompanyCreate,
    CompanyUpdate,
)
from core.company.service import (
    create_company,
    list_companies,
    get_company,
    update_company,
)

router = APIRouter()


# ============================================================
# CREATE — création d'une société (DATA ONLY)
# ============================================================
@router.post("/create")
def create_route(data: CompanyCreate):
    """
    Crée une société (sans aucun visuel).

    Les visuels sont associés UNIQUEMENT après création,
    via une action distincte.
    """
    try:
        company_id = create_company(data)
        return {"status": "ok", "id_company": company_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création société : {e}")


# ============================================================
# LIST — liste des sociétés actives
# ============================================================
@router.get("/list")
def list_route():
    """
    Retourne la liste des sociétés actives.
    """
    try:
        companies = list_companies()
        return {"status": "ok", "companies": companies}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste sociétés : {e}")


# ============================================================
# GET ONE — récupération d'une société
# ============================================================
@router.get("/{id_company}")
def get_route(id_company: str):
    """
    Récupère une société par son ID.
    """
    company = get_company(id_company)
    if not company:
        raise HTTPException(404, "Société introuvable")

    return {"status": "ok", "company": company}


# ============================================================
# UPDATE — mise à jour d'une société existante
# ============================================================
@router.put("/update/{id_company}")
def update_route(id_company: str, data: CompanyUpdate):
    """
    Met à jour une société existante.

    Peut inclure :
    - données métier
    - champs média (post-création)
    """
    try:
        updated = update_company(id_company, data)
        return {"status": "ok", "updated": updated}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour société : {e}")
