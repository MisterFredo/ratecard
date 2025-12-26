from fastapi import APIRouter, HTTPException
from api.axes.models import AxeCreate, AxeUpdate
from core.axes.service import (
    create_axe,
    update_axe,
    list_axes,
    get_axe,
    delete_axe
)

router = APIRouter()


@router.post("/create")
def create_route(payload: AxeCreate):
    try:
        id_axe = create_axe(payload)
        return {"status": "ok", "id_axe": id_axe}
    except Exception as e:
        raise HTTPException(400, f"Erreur création axe : {e}")


@router.put("/update/{id_axe}")
def update_route(id_axe: str, payload: AxeUpdate):
    try:
        update_axe(id_axe, payload)
        return {"status": "ok", "updated": id_axe}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour axe : {e}")


@router.get("/list")
def list_route():
    try:
        axes = list_axes()
        return {"status": "ok", "axes": axes}
    except Exception as e:
        raise HTTPException(500, f"Erreur list axes : {e}")


@router.get("/{id_axe}")
def get_route(id_axe: str):
    axe = get_axe(id_axe)
    if not axe:
        raise HTTPException(404, "Axe introuvable")
    return {"status": "ok", "axe": axe}


@router.delete("/{id_axe}")
def delete_route(id_axe: str):
    try:
        delete_axe(id_axe)
        return {"status": "ok", "deleted": id_axe}
    except Exception as e:
        raise HTTPException(400, f"Erreur suppression axe : {e}")


