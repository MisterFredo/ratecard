# backend/api/person/routes.py

from fastapi import APIRouter, HTTPException
from api.person.models import PersonCreate
from core.person.service import (
    create_person,
    list_persons,
    list_persons_by_company,
    get_person,
    update_person
)

router = APIRouter()


# ------------------------------------------------------------
# CREATE
# ------------------------------------------------------------
@router.post("/create")
def create_route(data: PersonCreate):
    """
    Crée un intervenant.
    """
    try:
        person_id = create_person(data)
        return {"status": "ok", "id_person": person_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création intervenant : {e}")


# ------------------------------------------------------------
# LIST ALL
# ------------------------------------------------------------
@router.get("/list")
def list_route():
    """
    Retourne tous les intervenants actifs (toutes sociétés).
    """
    try:
        persons = list_persons()
        return {"status": "ok", "persons": persons}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste intervenants : {e}")


# ------------------------------------------------------------
# LIST BY COMPANY
# ------------------------------------------------------------
@router.get("/company/{id_company}")
def by_company_route(id_company: str):
    """
    Retourne les intervenants d'une société donnée.
    """
    try:
        persons = list_persons_by_company(id_company)
        return {"status": "ok", "persons": persons}
    except Exception as e:
        raise HTTPException(400, f"Erreur récupération intervenants société : {e}")


# ------------------------------------------------------------
# GET ONE
# ------------------------------------------------------------
@router.get("/{id_person}")
def get_route(id_person: str):
    """
    Retourne un intervenant par ID.
    """
    person = get_person(id_person)
    if not person:
        raise HTTPException(404, "Intervenant introuvable")
    return {"status": "ok", "person": person}


# ------------------------------------------------------------
# UPDATE
# ------------------------------------------------------------
@router.put("/update/{id_person}")
def update_route(id_person: str, data: PersonCreate):
    """
    Met à jour un intervenant.
    """
    try:
        updated = update_person(id_person, data)
        return {"status": "ok", "updated": updated}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour intervenant : {e}")


