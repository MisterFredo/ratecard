from fastapi import APIRouter, HTTPException
from api.solution.models import (
    SolutionCreate,
    SolutionUpdate,
    SolutionOut,
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
    try:
        solution_id = create_solution(data)
        return {"status": "ok", "id_solution": solution_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création solution : {e}")


# ============================================================
# LIST
# ============================================================
@router.get("/list")
def list_route():
    try:
        solutions = list_solutions()
        return {"status": "ok", "solutions": solutions}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste solutions : {e}")


# ============================================================
# GET ONE
# ============================================================
@router.get("/{id_solution}", response_model=SolutionOut)
def get_route(id_solution: str):
    solution = get_solution(id_solution)

    if not solution:
        raise HTTPException(404, "Solution introuvable")

    return solution


# ============================================================
# UPDATE
# ============================================================
@router.put("/update/{id_solution}")
def update_route(id_solution: str, data: SolutionUpdate):
    try:
        updated = update_solution(id_solution, data)

        if not updated:
            raise HTTPException(
                404,
                "Solution introuvable ou aucune modification"
            )

        return {"status": "ok", "updated": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour solution : {e}")
