from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================

class SolutionCreate(BaseModel):
    """
    Création d'une solution.
    Contrat 100% snake_case côté API.
    """

    name: str = Field(..., min_length=1)

    id_company: Optional[str] = None
    description: Optional[str] = None

    content: Optional[str] = Field(None)

    status: str = "DRAFT"
    vectorise: bool = False

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE
# ============================================================

class SolutionUpdate(BaseModel):
    """
    Mise à jour partielle d'une solution.
    Tous les champs sont optionnels.
    """

    name: Optional[str] = None
    id_company: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None

    status: Optional[str] = None
    vectorise: Optional[bool] = None

    class Config:
        extra = "forbid"


# ============================================================
# OUT
# ============================================================

class SolutionOut(BaseModel):

    id_solution: str
    name: str

    id_company: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None

    status: str
    vectorise: bool

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        extra = "forbid"
