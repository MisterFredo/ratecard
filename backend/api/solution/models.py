from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================
class SolutionCreate(BaseModel):
    """
    Création d'une solution.
    """
    name: str
    id_company: Optional[str] = None
    description: Optional[str] = None
    content: str

    status: Optional[str] = "DRAFT"
    vectorise: Optional[bool] = False


# ============================================================
# UPDATE
# ============================================================
class SolutionUpdate(BaseModel):
    """
    Mise à jour partielle d'une solution.
    """
    name: Optional[str] = None
    id_company: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None

    status: Optional[str] = None
    vectorise: Optional[bool] = None


# ============================================================
# OUT
# ============================================================
class SolutionOut(BaseModel):
    """
    Représentation alignée côté API (snake_case).
    """
    id_solution: str
    name: str
    id_company: Optional[str] = None
    description: Optional[str] = None
    content: str

    status: Optional[str] = None
    vectorise: Optional[bool] = False

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
