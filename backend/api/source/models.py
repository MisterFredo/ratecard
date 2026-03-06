from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================

class SourceCreate(BaseModel):
    """
    Création d'une source éditoriale.
    Contrat API 100% snake_case.
    """

    source_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)

    type_source: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None

    author: Optional[str] = None
    author_profile: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE
# ============================================================

class SourceUpdate(BaseModel):
    """
    Mise à jour partielle d'une source.
    """

    name: Optional[str] = None

    type_source: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None

    author: Optional[str] = None
    author_profile: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# OUT
# ============================================================

class SourceOut(BaseModel):
    """
    Représentation retournée par l’API.
    Snake_case strict.
    """

    source_id: str
    name: str

    type_source: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None

    author: Optional[str] = None
    author_profile: Optional[str] = None

    created_at: Optional[datetime] = None

    class Config:
        extra = "forbid"
