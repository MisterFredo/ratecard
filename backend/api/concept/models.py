from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================
class ConceptCreate(BaseModel):
    """
    Création d'un concept = axe d’analyse métier.
    Léger, gouverné, réutilisable.
    """

    label: str = Field(..., min_length=1)
    description: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE
# ============================================================
class ConceptUpdate(BaseModel):
    """
    Mise à jour partielle d'un concept.
    """

    label: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

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
    label: str

    description: Optional[str] = None
    is_active: bool = True

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        extra = "forbid"
