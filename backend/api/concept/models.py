from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================
class ConceptCreate(BaseModel):
    """
    Création d'un concept métier.
    Contrat API 100% snake_case.
    """

    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    content: Optional[str] = None

    status: str = "DRAFT"
    vectorise: bool = False

    # Mono-topic
    id_topic: Optional[str] = None

    class Config:
        extra = "forbid"


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
    id_topic: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# OUT
# ============================================================
class ConceptOut(BaseModel):
    """
    Représentation retournée par l’API.
    """

    id_concept: str
    title: str

    description: Optional[str] = None
    content: Optional[str] = None

    status: str
    vectorise: bool

    id_topic: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        extra = "forbid"
