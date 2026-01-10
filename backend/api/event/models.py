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
    les visuels et paramètres front sont associés après création.
    """
    label: str
    description: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # 🔗 URL externe (site événement)
    external_url: Optional[str] = None


# ============================================================
# UPDATE — mise à jour d'un event existant
# ============================================================
class EventUpdate(BaseModel):
    """
    Modèle utilisé pour la mise à jour d'un event existant.

    - Tous les champs sont optionnels
    - Les champs média et Home/Nav sont autorisés ici
    """

    # Contenu
    label: Optional[str] = None
    description: Optional[str] = None

    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # Médias
    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None

    # 🔑 Pilotage front public
    home_label: Optional[str] = None
    home_order: Optional[int] = None
    is_active_home: Optional[bool] = None
    is_active_nav: Optional[bool] = None

    # 🎨 Signature visuelle (HOME / WORKFLOW)
    event_color: Optional[str] = None

    # 🔗 URL externe (site événement)
    external_url: Optional[str] = None

    # Statut
    is_active: Optional[bool] = None


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

    # Pilotage Home / Nav
    home_label: Optional[str] = None
    home_order: Optional[int] = None
    is_active_home: Optional[bool] = None
    is_active_nav: Optional[bool] = None

    # Médias
    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None

    # 🎨 Couleur d'événement
    event_color: Optional[str] = None

    # 🔗 URL externe
    external_url: Optional[str] = None

    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # Meta
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: Optional[bool] = True
