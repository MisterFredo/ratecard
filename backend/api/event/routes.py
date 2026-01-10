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
    Création d'un événement (données de base uniquement).

    ⚠️ Aucun média, aucun contexte ici.
    Le contexte événementiel est géré via UPDATE.
    """
    try:
        event_id = create_event(data)
        return {"status": "ok", "id_event": event_id}
    except Exception:
        raise HTTPException(400, "Erreur création event")


# ============================================================
# LIST — liste des events
# ============================================================
@router.get("/list")
def list_route():
    """
    Liste des événements.

    Utilisée :
    - côté admin
    - côté Home publique (événements actifs)
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
    Récupération d'un événement par ID.
    Inclut le contexte événementiel (si présent).
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
    Mise à jour d'un événement existant.

    Inclut :
    - champs éditoriaux
    - SEO
    - médias
    - pilotage Home / Nav
    - contexte événementiel (CONTEXT_HTML)
    """
    try:
        updated = update_event(id_event, data)
        return {"status": "ok", "updated": updated}
    except Exception:
        raise HTTPException(400, "Erreur mise à jour event")

