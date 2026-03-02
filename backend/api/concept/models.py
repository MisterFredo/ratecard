from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================
class ConceptCreate(BaseModel):
    """
    Création d'un concept métier.

    BLOCKS est stocké sous forme de string JSON.
    """
    title: str
    description: Optional[str] = None
    blocks: str  # JSON stringifié

    status: Optional[str] = "DRAFT"
    vectorise: Optional[bool] = False


# ============================================================
# UPDATE
# ============================================================
class ConceptUpdate(BaseModel):
    """
    Mise à jour partielle d'un concept.
    """
    title: Optional[str] = None
    description: Optional[str] = None
    blocks: Optional[str] = None

    status: Optional[str] = None
    vectorise: Optional[bool] = None


# ============================================================
# OUT
# ============================================================
class ConceptOut(BaseModel):
    """
    Représentation 1:1 avec RATECARD_CONCEPT.
    """
    id_concept: str
    title: str
    description: Optional[str] = None
    blocks: str

    status: Optional[str] = None
    vectorise: Optional[bool] = False

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
