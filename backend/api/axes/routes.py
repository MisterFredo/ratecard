# backend/api/axes/routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from core.axes.service import list_axes, create_axe, delete_axe

router = APIRouter()


class AxeCreatePayload(BaseModel):
    type: str = Field(..., description="TOPIC | PRODUCT | COMPANY_TAG")
    label: str


@router.get("/list")
def api_list_axes():
    try:
        axes = list_axes()
        return {"status": "ok", "axes": axes}
    except Exception as e:
        raise HTTPException(500, f"Erreur chargement axes : {e}")


@router.post("/create")
def api_create_axe(payload: AxeCreatePayload):
    try:
        axe_id = create_axe(payload.type, payload.label)
        return {"status": "ok", "id_axe": axe_id}
    except Exception as e:
        raise HTTPException(500, f"Erreur création axe : {e}")


@router.delete("/{id_axe}")
def api_delete_axe(id_axe: str):
    try:
        delete_axe(id_axe)
        return {"status": "ok", "deleted": id_axe}
    except Exception as e:
        raise HTTPException(500, f"Erreur suppression axe : {e}")
