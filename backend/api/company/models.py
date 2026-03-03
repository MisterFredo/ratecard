from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE — création d'une société
# ============================================================
class CompanyCreate(BaseModel):
    """
    Création d'une société.
    ⚠️ Aucun champ média ici.
    ⚠️ Champs alignés BQ
    """
    NAME: str
    DESCRIPTION: Optional[str] = None

    LINKEDIN_URL: Optional[str] = None
    WEBSITE_URL: Optional[str] = None

    IS_PARTNER: Optional[bool] = False


# ============================================================
# UPDATE — mise à jour d'une société existante
# ============================================================
class CompanyUpdate(BaseModel):
    """
    Mise à jour des données métier.
    Les visuels restent gérés via /visuals/company/*
    ⚠️ Champs alignés BQ
    """
    NAME: Optional[str] = None
    DESCRIPTION: Optional[str] = None

    LINKEDIN_URL: Optional[str] = None
    WEBSITE_URL: Optional[str] = None

    IS_PARTNER: Optional[bool] = None

    # --- Wiki (bloc unique) ---
    WIKI_CONTENT: Optional[str] = None


# ============================================================
# OUT — représentation alignée BQ
# ============================================================
class CompanyOut(BaseModel):
    """
    Représentation EXACTEMENT alignée avec RATECARD_COMPANY.
    Aucun snake_case.
    """

    ID_COMPANY: str
    NAME: str

    # --- Brand ---
    DESCRIPTION: Optional[str] = None

    # --- Wiki ---
    WIKI_CONTENT: Optional[str] = None
    WIKI_SOURCE_ID: Optional[str] = None
    WIKI_UPDATED_AT: Optional[datetime] = None
    WIKI_VECTORISED: Optional[bool] = False

    # --- Media ---
    MEDIA_LOGO_RECTANGLE_ID: Optional[str] = None

    # --- Liens ---
    LINKEDIN_URL: Optional[str] = None
    WEBSITE_URL: Optional[str] = None

    # --- Statut ---
    IS_PARTNER: Optional[bool] = False
    IS_ACTIVE: Optional[bool] = True

    # --- Dates ---
    CREATED_AT: Optional[datetime] = None
    UPDATED_AT: Optional[datetime] = None
