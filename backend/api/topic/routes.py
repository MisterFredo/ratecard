from fastapi import APIRouter, HTTPException
from api.topic.models import (
    TopicCreate,
    TopicUpdate,
)
from core.topic.service import (
    create_topic,
    list_topics,
    get_topic,
    update_topic,
)

router = APIRouter()


# ============================================================
# CREATE — création d'un topic (DATA ONLY)
# ============================================================
@router.post("/create")
def create_route(data: TopicCreate):
    """
    Crée un topic (sans aucun visuel).

    Les visuels sont associés UNIQUEMENT après création.
    """
    try:
        topic_id = create_topic(data)
        return {"status": "ok", "id_topic": topic_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création topic : {e}")


# ============================================================
# LIST — liste des topics actifs
# ============================================================
@router.get("/list")
def list_route():
    """
    Retourne la liste des topics actifs.
    """
    try:
        topics = list_topics()
        return {"status": "ok", "topics": topics}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste topics : {e}")


# ============================================================
# GET ONE — récupération d'un topic
# ============================================================
@router.get("/{id_topic}")
def get_route(id_topic: str):
    """
    Récupère un topic par son ID.
    """
    topic = get_topic(id_topic)
    if not topic:
        raise HTTPException(404, "Topic introuvable")

    return {"status": "ok", "topic": topic}


# ============================================================
# UPDATE — mise à jour d'un topic existant
# ============================================================
@router.put("/update/{id_topic}")
def update_route(id_topic: str, data: TopicUpdate):
    """
    Met à jour un topic existant.

    Peut inclure :
    - données éditoriales
    - SEO
    - champs média (post-création)
    """
    try:
        updated = update_topic(id_topic, data)
        return {"status": "ok", "updated": updated}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour topic : {e}")
