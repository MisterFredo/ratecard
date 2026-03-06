from fastapi import APIRouter, HTTPException
from api.solution.models import (
    SolutionCreate,
    SolutionUpdate,
)
from core.solution.service import (
    create_solution,
    list_solutions,
    get_solution,
    update_solution,
)

router = APIRouter()


# ============================================================
# CREATE
# ============================================================
@router.post("/create")
def create_route(data: SolutionCreate):
    """
    Crée une solution.
    """
    try:
        solution_id = create_solution(data)

        return {
            "status": "ok",
            "id_solution": solution_id,
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur création solution : {e}")


# ============================================================
# LIST
# ============================================================
@router.get("/list")
def list_route():
    """
    Retourne la liste des solutions.
    """
    try:
        solutions = list_solutions()

        return {
            "status": "ok",
            "solutions": solutions,
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur liste solutions : {e}")


# ============================================================
# GET ONE
# ============================================================
@router.get("/{id_solution}")
def get_route(id_solution: str):
    """
    Récupère une solution par son ID.
    """
    solution = get_solution(id_solution)

    if not solution:
        raise HTTPException(404, "Solution introuvable")

    return {
        "status": "ok",
        "solution": solution,
    }


# ============================================================
# UPDATE
# ============================================================
@router.put("/update/{id_solution}")
def update_route(id_solution: str, data: SolutionUpdate):
    """
    Met à jour une solution existante.
    """
    try:
        updated = update_solution(id_solution, data)

        return {
            "status": "ok",
            "updated": updated,
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour solution : {e}")
