from fastapi import APIRouter, HTTPException

from api.matching.models import SolutionMatch
from core.matching.service import (
    list_unmatched_solutions,
    match_solution,
)

router = APIRouter()


# ===============================================
# LIST LLM SOLUTIONS TO MATCH
# ===============================================

@router.get("/solutions")
def list_solutions():

    try:
        rows = list_unmatched_solutions()
        return {"status": "ok", "solutions": rows}

    except Exception as e:
        raise HTTPException(400, str(e))


# ===============================================
# APPLY MATCH
# ===============================================

@router.post("/solutions/match")
def apply_match(data: SolutionMatch):

    try:
        match_solution(data)
        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(400, str(e))
