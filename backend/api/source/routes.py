from fastapi import APIRouter, HTTPException
from typing import List

from api.source.models import (
    SourceCreate,
    SourceUpdate,
    SourceOut,
    SourceListOut,
)

from core.source.service import (
    create_source,
    list_sources,
    get_source,
    update_source,
    delete_source,
)

router = APIRouter()


# ============================================================
# CREATE — création d'une source
# ============================================================
@router.post("/create")
def create_route(data: SourceCreate):
    try:
        source_id = create_source(data)
        return {"status": "ok", "source_id": source_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création source : {e}")


# ============================================================
# LIST — liste des sources (verrouillée contractuellement)
# ============================================================
@router.get("/list", response_model=SourceListOut)
def list_route():
    try:
        sources = list_sources()
        return {
            "status": "ok",
            "sources": sources,
        }
    except Exception as e:
        raise HTTPException(400, f"Erreur liste sources : {e}")


# ============================================================
# GET ONE — récupération d'une source
# ============================================================
@router.get("/{source_id}", response_model=SourceOut)
def get_route(source_id: str):
    try:
        source = get_source(source_id)

        if not source:
            raise HTTPException(404, "Source introuvable")

        return source

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur récupération source : {e}")


# ============================================================
# UPDATE — mise à jour d'une source existante
# ============================================================
@router.put("/update/{source_id}")
def update_route(source_id: str, data: SourceUpdate):
    try:
        updated = update_source(source_id, data)

        if not updated:
            raise HTTPException(
                404,
                "Source introuvable ou aucune modification"
            )

        return {"status": "ok", "updated": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour source : {e}")


# ============================================================
# DELETE — suppression d'une source
# ============================================================
@router.delete("/{source_id}")
def delete_route(source_id: str):
    try:
        deleted = delete_source(source_id)

        if not deleted:
            raise HTTPException(404, "Source introuvable")

        return {"status": "ok", "deleted": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Erreur suppression source : {e}")
