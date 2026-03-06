from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from api.concept.models import (
    ConceptCreate,
    ConceptUpdate,
    ConceptOut,
)

from core.concept.service import (
    create_concept,
    list_concepts,
    get_concept,
    update_concept,
    delete_concept,
)

router = APIRouter()


# ============================================================
# CREATE
# ============================================================
@router.post("/create")
def create_route(data: ConceptCreate):
    try:
        concept_id = create_concept(data)
        return {"status": "ok", "id_concept": concept_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création concept : {e}")


# ============================================================
# LIST
# ============================================================
@router.get("/list")
def list_route(topic_ids: Optional[str] = Query(None)):
    """
    topic_ids:
        - None → retourne tous les concepts
        - "id1,id2" → filtre sur ces topics
    """
    try:
        if topic_ids:
            ids = [i.strip() for i in topic_ids.split(",") if i.strip()]
            concepts = list_concepts(topic_ids=ids)
        else:
            concepts = list_concepts()

        return {"status": "ok", "concepts": concepts}

    except Exception as e:
        raise HTTPException(400, f"Erreur liste concepts : {e}")


# ============================================================
# GET ONE
# ============================================================
@router.get("/{id_concept}", response_model=ConceptOut)
def get_route(id_concept: str):
    try:
        concept = get_concept(id_concept)

        if not concept:
            raise HTTPException(404, "Concept introuvable")

        return concept

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur récupération concept : {e}")


# ============================================================
# UPDATE
# ============================================================
@router.put("/update/{id_concept}")
def update_route(id_concept: str, data: ConceptUpdate):
    try:
        updated = update_concept(id_concept, data)

        if not updated:
            raise HTTPException(
                404,
                "Concept introuvable ou aucune modification"
            )

        return {"status": "ok", "updated": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour concept : {e}")


# ============================================================
# DELETE
# ============================================================
@router.delete("/{id_concept}")
def delete_route(id_concept: str):
    try:
        deleted = delete_concept(id_concept)

        if not deleted:
            raise HTTPException(404, "Concept introuvable")

        return {"status": "ok", "deleted": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur suppression concept : {e}")
