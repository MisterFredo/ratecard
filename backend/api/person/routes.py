# backend/api/person/routes.py

from fastapi import APIRouter, HTTPException
from backend.api.person.models import PersonCreate
from backend.api.person.service import (
    create_person,
    list_persons,
    list_persons_by_company,
    get_person
)

router = APIRouter()


@router.post("/create")
def create(data: PersonCreate):
    try:
        person_id = create_person(data)
        return {"status": "ok", "id_person": person_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création personne : {e}")


@router.get("/list")
def list_all():
    try:
        persons = list_persons()
        return {"status": "ok", "persons": persons}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste personnes : {e}")


@router.get("/company/{id_company}")
def list_for_company(id_company: str):
    try:
        persons = list_persons_by_company(id_company)
        return {"status": "ok", "persons": persons}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste par société : {e}")


@router.get("/{id_person}")
def get_one(id_person: str):
    person = get_person(id_person)
    if not person:
        raise HTTPException(404, "Personne introuvable")
    return {"status": "ok", "person": person}
