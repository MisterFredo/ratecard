from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# ============================================================
# TYPE CENTRALISÉ
# ============================================================

TopicAxis = Literal["MEDIA", "RETAIL", "FOUNDATIONS"]


# ============================================================
# CREATE
# ============================================================

class TopicCreate(BaseModel):
    """
    Création d'un topic (DATA ONLY).
    Aucun champ média ici.
    """

    label: str = Field(..., min_length=1)

    topic_axis: TopicAxis

    description: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

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
    topic_axis: Optional[TopicAxis] = None

    description: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# OUT
# ============================================================

class TopicOut(BaseModel):
    """
    Représentation retournée par l’API.
    Snake_case strict.
    """

    id_topic: str
    label: str
    topic_axis: Optional[TopicAxis] = None

    description: Optional[str] = None

    media_square_id: Optional[str] = None
    media_rectangle_id: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    is_active: bool = True

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        extra = "forbid"
