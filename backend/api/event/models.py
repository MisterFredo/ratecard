from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE — création d'un event (DATA ONLY)
# ============================================================
class EventCreate(BaseModel):
    """
    Modèle utilisé UNIQUEMENT à la création d'un event.

    ⚠️ AUCUN champ média ici :
    les visuels sont associés uniquement après création.
    """
    label: str
    description: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


# ============================================================
# UPDATE — mise à jour d'un event existant
# ============================================================
class EventUpdate(BaseModel):
    """
    Modèle utilisé pour la mise à jour d'un event existant.

    - Tous les champs sont optionnels
    - Les champs média sont autorisés ici (post-création)
    """
    label: Optional[str] = None
    description: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None


# ============================================================
# OUT — représentation d'un event
# ============================================================
class EventOut(BaseModel):
    """
    Modèle de sortie représentant l'état d'un event.
    Aligné 1:1 avec la table RATECARD_EVENT.
    """
    id_event: str
    label: str
    description: Optional[str] = None

    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: Optional[bool] = True
