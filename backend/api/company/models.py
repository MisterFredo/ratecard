from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE
# ============================================================

class CompanyCreate(BaseModel):
    """
    Création d'une société.
    Contrat API 100% snake_case.
    """

    name: str = Field(..., min_length=1)
    description: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    is_partner: bool = False

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE
# ============================================================

class CompanyUpdate(BaseModel):
    """
    Mise à jour partielle.
    Les médias restent gérés via /visuals/company/*
    """

    name: Optional[str] = None
    description: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    is_partner: Optional[bool] = None

    # --- Wiki ---
    wiki_content: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# OUT
# ============================================================

class CompanyOut(BaseModel):
    """
    Représentation retournée par l’API.
    Snake_case strict.
    """

    id_company: str
    name: str

    # --- Brand ---
    description: Optional[str] = None

    # --- Wiki ---
    wiki_content: Optional[str] = None
    wiki_source_id: Optional[str] = None
    wiki_updated_at: Optional[datetime] = None
    wiki_vectorised: bool = False

    # --- Media ---
    media_logo_rectangle_id: Optional[str] = None

    # --- Liens ---
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    # --- Statut ---
    is_partner: bool = False
    is_active: bool = True

    # --- Dates ---
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        extra = "forbid"
