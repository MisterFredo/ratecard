from fastapi import APIRouter, HTTPException
from api.event.models import (
    EventCreate,
    EventUpdate,
)
from core.event.service import (
    create_event,
    list_events,
    get_event,
    update_event,
)

router = APIRouter()


# ============================================================
# CREATE — création d'un event (DATA ONLY)
# ============================================================
@router.post("/create")
def create_route(data: EventCreate):
    """
    Crée un event (sans aucun visuel).

    Les visuels sont associés UNIQUEMENT après création.
    """
    try:
        event_id = create_event(data)
        return {"status": "ok", "id_event": event_id}
    except Exception:
        raise HTTPException(400, "Erreur création event")


# ============================================================
# LIST — liste des events actifs
# ============================================================
@router.get("/list")
def list_route():
    """
    Retourne la liste des events actifs.
    """
    try:
        events = list_events()
        return {"status": "ok", "events": events}
    except Exception:
        raise HTTPException(400, "Erreur liste events")


# ============================================================
# GET ONE — récupération d'un event
# ============================================================
@router.get("/{id_event}")
def get_route(id_event: str):
    """
    Récupère un event par son ID.
    """
    event = get_event(id_event)
    if not event:
        raise HTTPException(404, "Event introuvable")

    return {"status": "ok", "event": event}


# ============================================================
# UPDATE — mise à jour d'un event existant
# ============================================================
@router.put("/update/{id_event}")
def update_route(id_event: str, data: EventUpdate):
    """
    Met à jour un event existant.

    Peut inclure :
    - données éditoriales
    - SEO
    - champs média
    - pilotage Home / Nav
    """
    try:
        updated = update_event(id_event, data)
        return {"status": "ok", "updated": updated}
    except Exception:
        raise HTTPException(400, "Erreur mise à jour event")
