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
    NAME: str
    ID_COMPANY: Optional[str] = None
    DESCRIPTION: Optional[str] = None
    CONTENT: str

    STATUS: Optional[str] = "DRAFT"
    VECTORISE: Optional[bool] = False


# ============================================================
# UPDATE
# ============================================================
class SolutionUpdate(BaseModel):
    """
    Mise à jour partielle d'une solution.
    """
    NAME: Optional[str] = None
    ID_COMPANY: Optional[str] = None
    DESCRIPTION: Optional[str] = None
    CONTENT: Optional[str] = None

    STATUS: Optional[str] = None
    VECTORISE: Optional[bool] = None


# ============================================================
# OUT
# ============================================================
class SolutionOut(BaseModel):
    """
    Représentation alignée 1:1 avec RATECARD_SOLUTION.
    """
    ID_SOLUTION: str
    NAME: str
    ID_COMPANY: Optional[str] = None
    DESCRIPTION: Optional[str] = None
    CONTENT: str

    STATUS: Optional[str] = None
    VECTORISE: Optional[bool] = False

    CREATED_AT: Optional[datetime] = None
    UPDATED_AT: Optional[datetime] = None
