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
    ⚠️ Champs alignés BQ
    """

    TITLE: str
    DESCRIPTION: Optional[str] = None
    CONTENT: Optional[str] = None

    STATUS: Optional[str] = "DRAFT"
    VECTORISE: Optional[bool] = False

    # 🔥 Nouveau : 0 ou 1 topic
    ID_TOPIC: Optional[str] = None


# ============================================================
# UPDATE
# ============================================================
class ConceptUpdate(BaseModel):
    """
    Mise à jour partielle d'un concept.
    ⚠️ Champs alignés BQ
    """

    TITLE: Optional[str] = None
    DESCRIPTION: Optional[str] = None
    CONTENT: Optional[str] = None

    STATUS: Optional[str] = None
    VECTORISE: Optional[bool] = None

    # 🔥 Mono-topic
    ID_TOPIC: Optional[str] = None


# ============================================================
# OUT
# ============================================================
class ConceptOut(BaseModel):
    """
    Représentation alignée avec RATECARD_CONCEPT.
    100% MAJUSCULES.
    """

    ID_CONCEPT: str
    TITLE: str
    DESCRIPTION: Optional[str] = None
    CONTENT: Optional[str] = None

    STATUS: Optional[str] = None
    VECTORISE: Optional[bool] = False

    # 🔥 Mono-topic
    ID_TOPIC: Optional[str] = None

    CREATED_AT: Optional[datetime] = None
    UPDATED_AT: Optional[datetime] = None
