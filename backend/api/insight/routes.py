from fastapi import APIRouter, HTTPException

from api.insight.models import InsightRequest
from core.insight.service import run_insight_pipeline

router = APIRouter()


# ============================================================
# INSIGHT (UNIQUE ENTRY POINT)
# ============================================================

@router.post("/")
def insight_route(payload: InsightRequest):
    """
    Génération d'insight LLM uniquement.

    Input :
    - ids : List[str]

    Output :
    - insight : str
    """

    try:
        # =====================================================
        # PIPELINE (LLM ONLY)
        # =====================================================

        result = run_insight_pipeline(payload.ids)

        if result["status"] == "empty":
            return {
                "status": "empty",
                "insight": "",
            }

        # =====================================================
        # SUCCESS
        # =====================================================

        return {
            "status": "ok",
            "insight": result["insight"],
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur insight : {e}")
