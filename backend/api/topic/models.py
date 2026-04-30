from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE
# ============================================================

class TopicCreate(BaseModel):
    """
    Création d'un topic (DATA ONLY).
    Les univers sont passés séparément.
    """

    label: str = Field(..., min_length=1)

    description: Optional[str] = None
    insight_frequency: Optional[str] = "QUARTERLY"

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # 🔥 NOUVEAU
    universe_ids: Optional[List[str]] = []

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE
# ============================================================

class TopicUpdate(BaseModel):
    """
    Mise à jour partielle d'un topic existant.
    """

    label: Optional[str] = None

    description: Optional[str] = None
    insight_frequency: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None

    # 🔥 NOUVEAU
    universe_ids: Optional[List[str]] = None

    class Config:
        extra = "forbid"


# ============================================================
# OUT
# ============================================================

class TopicOut(BaseModel):
    """
    Représentation retournée par l’API.
    """

    id_topic: str
    label: str

    description: Optional[str] = None
    insight_frequency: Optional[str] = None

    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    is_active: bool = True

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # 🔥 NOUVEAU
    universes: Optional[List[dict]] = []

    has_numbers: Optional[bool] = False

    class Config:
        extra = "forbid"
