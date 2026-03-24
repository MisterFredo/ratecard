from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from core.insight.service import (
    get_items_by_ids,
    build_insight_payload,
    generate_insight,
)

router = APIRouter()


# ============================================================
# MODELS (inline pour l'instant)
# ============================================================

class InsightRequest(BaseModel):
    ids: List[str]

    # 🔥 permet d’activer / non le LLM
    mode: Optional[str] = "preview"  # "preview" | "insight"


# ============================================================
# INSIGHT (UNIQUE ENTRY POINT)
# ============================================================

@router.post("/")
def insight_route(payload: InsightRequest):
    """
    Endpoint unique pour :
    - preview (données structurées)
    - insight (LLM plus tard)

    ⚠️ Le front gère le rendu (scan / email / etc.)
    """

    try:
        # =====================================================
        # 1. RÉCUPÉRATION
        # =====================================================

        items = get_items_by_ids(payload.ids)

        if not items:
            return {
                "status": "empty",
                "items": [],
            }

        # =====================================================
        # 2. BUILD PAYLOAD
        # =====================================================

        insight_payload = build_insight_payload(items)

        # =====================================================
        # 3. MODE PREVIEW (DEFAULT)
        # =====================================================

        if payload.mode == "preview":
            return {
                "status": "ok",
                "mode": "preview",
                "items": insight_payload,
            }

        # =====================================================
        # 4. MODE INSIGHT (LLM)
        # =====================================================

        if payload.mode == "insight":
            result = generate_insight(insight_payload)

            return {
                "status": "ok",
                "mode": "insight",
                "result": result,
            }

        # =====================================================
        # 5. FALLBACK
        # =====================================================

        return {
            "status": "error",
            "message": "Invalid mode",
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur insight : {e}")
