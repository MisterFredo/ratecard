from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional

from api.matching.models import (
    SolutionMatch,
    CompanyMatch,
    BulkCompanyMatchRequest,
    BulkSolutionMatchRequest,
)

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

        return {
            "status": "ok",
            "solutions": rows
        }

    except Exception as e:

        raise HTTPException(
            400,
            str(e)
        )

# ===============================================
# APPLY SOLUTION MATCH
# ===============================================

@router.post("/solutions/match")
def apply_solution_match(
    data: SolutionMatch
):

    try:

        match_solution(data)

        return {
            "status": "ok"
        }

    except Exception as e:

        raise HTTPException(
            400,
            str(e)
        )

# ===============================================
# BULK SOLUTION MATCH
# ===============================================

@router.post("/solutions/bulk-match")
def bulk_solution_match(
    payload: BulkSolutionMatchRequest
):

    results = []

    for item in payload.items:

        try:

            match_solution(
                SolutionMatch(
                    alias=item.alias,
                    id_solution=item.id_solution,
                    action=item.action,
                )
            )

            results.append({
                "alias": item.alias,
                "status": "ok",
            })

        except Exception as e:

            results.append({
                "alias": item.alias,
                "status": "error",
                "error": str(e),
            })

    return {
        "status": "ok",
        "total": len(payload.items),
        "matched": len([
            r for r in results
            if r["status"] == "ok"
        ]),
        "errors": len([
            r for r in results
            if r["status"] == "error"
        ]),
        "results": results,
    }

# ===============================================
# LIST LLM COMPANIES TO MATCH
# ===============================================

@router.get("/companies")
def list_companies():

    try:

        rows = list_unmatched_companies()

        return {
            "status": "ok",
            "companies": rows
        }

    except Exception as e:

        raise HTTPException(
            400,
            str(e)
        )

# ===============================================
# APPLY COMPANY MATCH
# ===============================================

@router.post("/companies/match")
def apply_company_match(
    data: CompanyMatch
):

    try:

        match_company(data)

        return {
            "status": "ok"
        }

    except Exception as e:

        raise HTTPException(
            400,
            str(e)
        )

# ===============================================
# BULK COMPANY MATCH
# ===============================================

@router.post("/companies/bulk-match")
def bulk_company_match(
    payload: BulkCompanyMatchRequest
):

    results = []

    for item in payload.items:

        try:

            match_company(
                CompanyMatch(
                    alias=item.alias,
                    id_company=item.id_company,
                    action=item.action,
                )
            )

            results.append({
                "alias": item.alias,
                "status": "ok",
            })

        except Exception as e:

            results.append({
                "alias": item.alias,
                "status": "error",
                "error": str(e),
            })

    return {
        "status": "ok",
        "total": len(payload.items),
        "matched": len([
            r for r in results
            if r["status"] == "ok"
        ]),
        "errors": len([
            r for r in results
            if r["status"] == "error"
        ]),
        "results": results,
    }
