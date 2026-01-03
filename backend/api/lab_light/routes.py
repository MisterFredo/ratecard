from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from core.lab_light.service import transform_source

router = APIRouter()


# ============================================================
# MODELS
# ============================================================

class ContextPerson(BaseModel):
    name: str
    role: Optional[str] = None


class TransformContext(BaseModel):
    topics: List[str] = Field(default_factory=list)
    companies: List[str] = Field(default_factory=list)
    persons: List[ContextPerson] = Field(default_factory=list)


class TransformPayload(BaseModel):
    source_type: str = Field(
        ...,
        description="Type : LINKEDIN_POST / PRESS_RELEASE / ARTICLE / INTERVIEW / OTHER"
    )
    source_text: str = Field(
        ...,
        description="Texte brut à transformer"
    )
    author: str = Field(
        ...,
        description="Nom de l'auteur (sélectionné)"
    )
    context: TransformContext = Field(
        default_factory=TransformContext,
        description="Contexte éditorial enrichi"
    )


# ============================================================
# ROUTE — SOURCE → ARTICLE (IA)
# ============================================================

@router.post("/transform")
def api_transform_source(payload: TransformPayload):
    """
    Transforme une source brute en brouillon d'article éditorial.

    Retourne STRICTEMENT :
    - title
    - excerpt
    - content_html
    - outro
    """

    try:
        draft = transform_source(
            source_type=payload.source_type,
            source_text=payload.source_text,
            author=payload.author,
            context={
                "topics": payload.context.topics,
                "companies": payload.context.companies,
                "persons": [
                    {"name": p.name, "role": p.role}
                    for p in payload.context.persons
                ],
            },
        )

        if not draft or "error" in draft:
            raise HTTPException(
                status_code=400,
                detail=f"Erreur IA : {draft.get('error', 'unknown')}"
            )

        return {
            "status": "ok",
            "draft": draft,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur LAB Light : {e}"
        )
