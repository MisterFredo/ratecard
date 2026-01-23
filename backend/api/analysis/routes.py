from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from core.content.service import (
    get_content,
    list_contents,  # lecture "publique" / curator
)

router = APIRouter()

# ============================================================
# LIST ANALYSES — CURATOR (SCOPED)
# ============================================================
@router.get("/list")
def list_analyses(
    topic_id: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
):
    """
    Liste des analyses pour Curator.
    ⚠️ Requiert un scope (topic_id OU company_id).
    """
    if not topic_id and not company_id:
        raise HTTPException(
            status_code=400,
            detail="topic_id or company_id is required",
        )

    items = list_contents(
        topic_id=topic_id,
        company_id=company_id,
        limit=limit,
    )

    return {"items": items}


# ============================================================
# READ ONE ANALYSIS — CURATOR
# ============================================================
@router.get("/{id_content}")
def read_analysis(id_content: str):
    """
    Lecture d’une analyse (Curator).
    Réutilise strictement la même source que l’admin.
    """
    content = get_content(id_content)

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Analyse introuvable",
        )

    return content
