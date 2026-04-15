from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional

from api.solution.models import (
    SolutionCreate,
    SolutionUpdate,
)

from core.solution.service import (
    create_solution,
    list_solutions,
    get_solution,
    update_solution,
    delete_solution,
    list_solutions_for_user,
)

# 🔥 CURATOR
from core.curator.entity_service import get_solution_view
from utils.auth import get_user_id_from_request

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
# LIST (ADMIN / GLOBAL)
# ============================================================

@router.get("/list")
def list_route():
    try:
        solutions = list_solutions()
        return {"status": "ok", "solutions": solutions}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste solutions : {e}")


# ============================================================
# LIST CURATOR (UNIVERSE ONLY)
# ============================================================

@router.get("/list-curator")
def list_solutions_curator(request: Request):

    user_id = request.headers.get("x-user-id")

    if not user_id:
        raise HTTPException(401, "User ID missing")

    try:
        solutions = list_solutions_for_user(user_id)

        return {
            "status": "ok",
            "solutions": solutions,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur liste solutions curator : {e}"
        )
# ============================================================
# GET ONE (ADMIN)
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
# VIEW (CURATOR)
# ============================================================

@router.get("/{id_solution}/view")
def get_solution_view_route(
    id_solution: str,
    limit: int = 20,
    offset: int = 0,
    universe_id: Optional[str] = Query(None),
):
    try:
        solution = get_solution_view(
            solution_id=id_solution,
            limit=limit,
            offset=offset,
            universe_id=universe_id if universe_id else None,
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
