from fastapi import APIRouter, HTTPException
from api.person.models import (
    PersonCreate,
    PersonUpdate,
)
from core.person.service import (
    create_person,
    list_persons,
    get_person,
    update_person,
)

router = APIRouter()


# ============================================================
# CREATE — création d'une personne (DATA ONLY)
# ============================================================
@router.post("/create")
def create_route(data: PersonCreate):
    """
    Crée une personne (sans aucun visuel).

    Les visuels sont associés UNIQUEMENT après création.
    """
    try:
        person_id = create_person(data)
        return {"status": "ok", "id_person": person_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création personne : {e}")


# ============================================================
# LIST — liste des personnes actives
# ============================================================
@router.get("/list")
def list_route():
    """
    Retourne la liste des personnes actives.
    """
    try:
        persons = list_persons()
        return {"status": "ok", "persons": persons}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste personnes : {e}")


# ============================================================
# GET ONE — récupération d'une personne
# ============================================================
@router.get("/{id_person}")
def get_route(id_person: str):
    """
    Récupère une personne par son ID.
    """
    person = get_person(id_person)
    if not person:
        raise HTTPException(404, "Personne introuvable")

    return {"status": "ok", "person": person}


# ============================================================
# UPDATE — mise à jour d'une personne existante
# ============================================================
@router.put("/update/{id_person}")
def update_route(id_person: str, data: PersonUpdate):
    """
    Met à jour une personne existante.

    Peut inclure :
    - données métier
    - rattachement société
    - champs média (post-création)
    """
    try:
        updated = update_person(id_person, data)
        return {"status": "ok", "updated": updated}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour personne : {e}")
