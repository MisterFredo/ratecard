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
    Endpoint unique :

    - preview → items + email
    - insight → items + email + insight + final_email
    """

    try:
        # =====================================================
        # PIPELINE
        # =====================================================

        result = run_insight_pipeline(payload.ids)

        if result["status"] == "empty":
            return {
                "status": "empty",
                "mode": payload.mode,
                "items": [],
                "email": "",
            }

        # =====================================================
        # PREVIEW
        # =====================================================

        if payload.mode == "preview":
            return {
                "status": "ok",
                "mode": "preview",
                "items": result["items"],
                "email": result["email"],
            }

        # =====================================================
        # INSIGHT
        # =====================================================

        if payload.mode == "insight":
            return {
                "status": "ok",
                "mode": "insight",
                "items": result["items"],
                "email": result["email"],
                "insight": result["insight"],
                "final_email": result["final_email"],
            }

        # =====================================================
        # FALLBACK
        # =====================================================

        return {
            "status": "error",
            "message": "Invalid mode",
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur insight : {e}")
