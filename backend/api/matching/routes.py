from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional

from api.matching.models import SolutionMatch, CompanyMatch

from core.matching.service_solution import (
    list_unmatched_solutions,
    match_solution,
)

from core.matching.service_company import (
    list_unmatched_companies,
    match_company,
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
# APPLY SOLUTION MATCH
# ===============================================

@router.post("/solutions/match")
def apply_solution_match(data: SolutionMatch):

    try:
        match_solution(data)
        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(400, str(e))


# ===============================================
# LIST LLM COMPANIES TO MATCH
# ===============================================

@router.get("/companies")
def list_companies():

    try:
        rows = list_unmatched_companies()
        return {"status": "ok", "companies": rows}

    except Exception as e:
        raise HTTPException(400, str(e))


# ===============================================
# APPLY COMPANY MATCH
# ===============================================

@router.post("/companies/match")
def apply_company_match(data: CompanyMatch):

    try:
        match_company(data)
        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(400, str(e))
