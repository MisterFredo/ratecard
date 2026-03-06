from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================
class ConceptCreate(BaseModel):
    """
    Création d'un concept métier.
    Content = HTML complet.
    """

    title: str
    description: Optional[str] = None
    content: Optional[str] = None

    status: Optional[str] = "DRAFT"
    vectorise: Optional[bool] = False

    # 🔥 Nouveau : 0 ou 1 topic
    id_topic: Optional[str] = None


# ============================================================
# UPDATE
# ============================================================
class ConceptUpdate(BaseModel):
    """
    Mise à jour partielle d'un concept.
    """

    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None

    status: Optional[str] = None
    vectorise: Optional[bool] = None

    # 🔥 Mono-topic
    id_topic: Optional[str] = None


# ============================================================
# OUT
# ============================================================
class ConceptOut(BaseModel):
    """
    Représentation côté API.
    """

    id_concept: str
    title: str
    description: Optional[str] = None
    content: Optional[str] = None

    status: Optional[str] = None
    vectorise: Optional[bool] = False

    # 🔥 Mono-topic
    id_topic: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
