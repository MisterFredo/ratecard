from fastapi import APIRouter, HTTPException, Query, Request

from api.solution.models import (
    SolutionCreate,
    SolutionUpdate,
    SolutionOut,
)

from core.solution.service import (
    create_solution,
    list_solutions,
    get_solution,
    list_solutions_for_user,
    update_solution,
    delete_solution,
)

# 🔥 CURATOR
from core.curator.entity_service import get_solution_view

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
# GET ONE (ADMIN / CRUD)
# ============================================================
@router.get("/{id_solution}")
def get_route(id_solution: str):
    try:
        solution = get_solution(id_solution)

        if not solution:
            raise HTTPException(404, "Solution introuvable")

        return {"status": "ok", "solution": solution}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur récupération solution : {e}")


# ============================================================
# GET VIEW (CURATOR)
# ============================================================
@router.get("/{id_solution}/view")
def get_solution_view_route(
    request: Request,
    id_solution: str,
    limit: int = 20,
    offset: int = 0
):
    try:
        user_id = request.cookies.get("curator_user_id")

        solution = get_solution_view(
            id_solution,
            limit=limit,
            offset=offset,
            user_id=user_id,  # 🔥 CRUCIAL
        )

        if not solution:
            raise HTTPException(404, "Solution introuvable")

        return solution

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur récupération solution view : {e}"
        )


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


# ============================================================
# DELETE
# ============================================================
@router.delete("/{id_solution}")
def delete_route(id_solution: str):
    try:
        deleted = delete_solution(id_solution)

        if not deleted:
            raise HTTPException(404, "Solution introuvable")

        return {"status": "ok", "deleted": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur suppression solution : {e}")

@router.get("/list-curator")
def list_curator_solutions(request: Request):

    user_id = request.cookies.get("curator_user_id")

    solutions = list_solutions_for_user(user_id)

    return {
        "status": "ok",
        "solutions": solutions
    }
