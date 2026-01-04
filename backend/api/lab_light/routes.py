from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional

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
    source_type: str
    source_text: str
    author: str
    context: TransformContext


# ============================================================
# ROUTE — SOURCE → ARTICLE (IA)
# ============================================================

@router.post("/transform")
def api_transform_source(payload: TransformPayload):
    """
    Transforme une source brute en brouillon d'article éditorial.

    ⚠️ CETTE ROUTE NE DOIT JAMAIS LEVER D'EXCEPTION.
    """

    try:
        result = transform_source(
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

        # 🔎 LOG TEMPORAIRE (ESSENTIEL)
        print("LAB_LIGHT RESULT:", result)

        if not isinstance(result, dict):
            return {
                "status": "error",
                "error": "invalid_return_type",
                "raw": str(result),
            }

        if "error" in result:
            return {
                "status": "error",
                "error": result.get("error"),
                "message": result.get("message"),
                "raw": result.get("raw"),
            }

        return {
            "status": "ok",
            "draft": result,
        }

    except Exception as e:
        # 🔥 DERNIER FILET DE SÉCURITÉ
        print("LAB_LIGHT FATAL ERROR:", str(e))
        return {
            "status": "error",
            "error": "fatal_backend_error",
            "message": str(e),
        }
