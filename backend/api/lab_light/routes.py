# backend/api/lab_light/routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from core.lab_light.service import transform_source


router = APIRouter()


# ============================================================
# 🔧 Pydantic model for input
# ============================================================
class TransformPayload(BaseModel):
    source_type: str = Field(..., description="Type : LINKEDIN_POST / PRESS_RELEASE / INTERVIEW / EVENT_RECAP / OTHER")
    source_text: str = Field(..., description="Texte brut à transformer")
    author: str | None = Field(None, description="Nom de l'auteur (optionnel)")


# ============================================================
# 🚀 Endpoint : Transform source → Article Draft
# ============================================================
@router.post("/transform")
def api_transform_source(payload: TransformPayload):
    """
    Transforme une source brute (post LinkedIn, communiqué, interview, compte-rendu)
    en ARTICLE_DRAFT Ratecard via LAB Light.
    """

    try:
        draft = transform_source(
            source_type=payload.source_type,
            source_text=payload.source_text,
            author=payload.author or ""
        )

        # draft peut contenir une erreur de parsing
        return {
            "status": "ok",
            "draft": draft
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur LAB Light : {e}"
        )
