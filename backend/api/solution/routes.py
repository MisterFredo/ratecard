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
            "STATUS": "OK",
            "ID_SOLUTION": solution_id,
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
            "STATUS": "OK",
            "SOLUTIONS": solutions,
        }
    except Exception as e:
        raise HTTPException(400, f"Erreur liste solutions : {e}")


# ============================================================
# GET ONE
# ============================================================
@router.get("/{ID_SOLUTION}")
def get_route(ID_SOLUTION: str):
    """
    Récupère une solution par son ID.
    """
    solution = get_solution(ID_SOLUTION)

    if not solution:
        raise HTTPException(404, "Solution introuvable")

    return {
        "STATUS": "OK",
        "SOLUTION": solution,
    }


# ============================================================
# UPDATE
# ============================================================
@router.put("/update/{ID_SOLUTION}")
def update_route(ID_SOLUTION: str, data: SolutionUpdate):
    """
    Met à jour une solution existante.
    """
    try:
        updated = update_solution(ID_SOLUTION, data)

        return {
            "STATUS": "OK",
            "UPDATED": updated,
        }
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour solution : {e}")
