from fastapi import APIRouter, HTTPException
from api.concept.models import (
    ConceptCreate,
    ConceptUpdate,
)
from core.concept.service import (
    create_concept,
    list_concepts,
    get_concept,
    update_concept,
)

router = APIRouter()


# ============================================================
# CREATE — création d'un concept
# ============================================================
@router.post("/create")
def create_route(data: ConceptCreate):
    """
    Crée un concept métier.

    Les blocs sont stockés en JSON stringifié.
    """
    try:
        concept_id = create_concept(data)
        return {"status": "ok", "id_concept": concept_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création concept : {e}")


# ============================================================
# LIST — liste des concepts actifs
# ============================================================
@router.get("/list")
def list_route():
    """
    Retourne la liste des concepts actifs.
    """
    try:
        concepts = list_concepts()
        return {"status": "ok", "concepts": concepts}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste concepts : {e}")


# ============================================================
# GET ONE — récupération d'un concept
# ============================================================
@router.get("/{id_concept}")
def get_route(id_concept: str):
    """
    Récupère un concept par son ID.
    """
    concept = get_concept(id_concept)
    if not concept:
        raise HTTPException(404, "Concept introuvable")

    return {"status": "ok", "concept": concept}


# ============================================================
# UPDATE — mise à jour d'un concept existant
# ============================================================
@router.put("/update/{id_concept}")
def update_route(id_concept: str, data: ConceptUpdate):
    """
    Met à jour un concept existant.

    Peut inclure :
    - titre
    - description
    - blocs JSON
    - statut
    - flag vectorisation
    """
    try:
        updated = update_concept(id_concept, data)
        return {"status": "ok", "updated": updated}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour concept : {e}")
