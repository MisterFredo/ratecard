from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE — création d'un topic (DATA ONLY)
# ============================================================
class TopicCreate(BaseModel):
    """
    Modèle utilisé UNIQUEMENT à la création d'un topic.

    ⚠️ AUCUN champ média ici :
    les visuels sont associés uniquement après création.

    topic_axis :
    - BUSINESS : enjeu / mécanique business
    - FIELD    : domaine / contexte / terrain d'expression
    """
    label: str
    topic_axis: str  # BUSINESS | FIELD

    description: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


# ============================================================
# UPDATE — mise à jour d'un topic existant
# ============================================================
class TopicUpdate(BaseModel):
    """
    Modèle utilisé pour la mise à jour d'un topic existant.

    - Tous les champs sont optionnels
    - Les champs média sont autorisés ici (post-création)
    """
    label: Optional[str] = None
    topic_axis: Optional[str] = None  # BUSINESS | FIELD

    description: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None


# ============================================================
# OUT — représentation d'un topic
# ============================================================
class TopicOut(BaseModel):
    """
    Modèle de sortie représentant l'état d'un topic.
    Aligné 1:1 avec la table RATECARD_TOPIC.
    """
    id_topic: str
    label: str
    topic_axis: Optional[str] = None  # BUSINESS | FIELD

    description: Optional[str] = None

    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: Optional[bool] = True
