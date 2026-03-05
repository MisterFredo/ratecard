from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================
class SourceCreate(BaseModel):
    """
    Création d'une source éditoriale.
    ⚠️ Champs alignés avec RATECARD_SOURCE
    """

    SOURCE_ID: str
    NAME: str

    TYPE_SOURCE: Optional[str] = None
    DESCRIPTION: Optional[str] = None
    DOMAIN: Optional[str] = None

    AUTHOR: Optional[str] = None
    AUTHOR_PROFILE: Optional[str] = None


# ============================================================
# UPDATE
# ============================================================
class SourceUpdate(BaseModel):
    """
    Mise à jour partielle d'une source.
    """

    NAME: Optional[str] = None

    TYPE_SOURCE: Optional[str] = None
    DESCRIPTION: Optional[str] = None
    DOMAIN: Optional[str] = None

    AUTHOR: Optional[str] = None
    AUTHOR_PROFILE: Optional[str] = None


# ============================================================
# OUT
# ============================================================
class SourceOut(BaseModel):
    """
    Représentation alignée avec RATECARD_SOURCE.
    """

    SOURCE_ID: str
    NAME: str

    TYPE_SOURCE: Optional[str] = None
    DESCRIPTION: Optional[str] = None
    DOMAIN: Optional[str] = None

    AUTHOR: Optional[str] = None
    AUTHOR_PROFILE: Optional[str] = None

    CREATED_AT: Optional[datetime] = None
