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
# CREATE — création d'une société
# ============================================================
@router.post("/create")
def create_route(data: CompanyCreate):
    """
    Crée une société (sans aucun visuel).
    ⚠️ Contrat MAJUSCULES
    """
    try:
        company_id = create_company(data)
        return {"status": "ok", "ID_COMPANY": company_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création société : {e}")


# ============================================================
# LIST — liste des sociétés actives (LIGHT)
# ============================================================
@router.get("/list")
def list_route():
    """
    Retourne la liste des sociétés actives.
    ⚠️ Doit renvoyer des champs MAJUSCULES.
    """
    try:
        companies = list_companies()
        return {"status": "ok", "companies": companies}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste sociétés : {e}")


# ============================================================
# GET ONE — récupération complète
# ============================================================
@router.get("/{id_company}")
def get_route(id_company: str):
    """
    Récupère une société complète par son ID.
    ⚠️ Renvoie brut BQ (MAJUSCULES)
    """
    try:
        company = get_company(id_company)

        if not company:
            raise HTTPException(404, "Société introuvable")

        return {"status": "ok", "company": company}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur récupération société : {e}")


# ============================================================
# UPDATE — mise à jour
# ============================================================
@router.put("/update/{id_company}")
def update_route(id_company: str, data: CompanyUpdate):
    """
    Met à jour une société existante.
    ⚠️ Champs attendus en MAJUSCULES
    """
    try:
        updated = update_company(id_company, data)

        if not updated:
            raise HTTPException(
                404,
                "Société introuvable ou aucune modification"
            )

        return {"status": "ok", "UPDATED": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour société : {e}")
