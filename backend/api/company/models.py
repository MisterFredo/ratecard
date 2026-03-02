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
    """
    name: str
    description: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    # Statut partenaire
    is_partner: Optional[bool] = False


# ============================================================
# UPDATE — mise à jour d'une société existante
# ============================================================
class CompanyUpdate(BaseModel):
    """
    Mise à jour des données métier.
    Les visuels restent gérés via /visuals/company/*
    """
    name: Optional[str] = None
    description: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    is_partner: Optional[bool] = None

    # --- Wiki (bloc unique) ---
    wiki_content: Optional[str] = None


# ============================================================
# OUT — représentation frontend-ready
# ============================================================
class CompanyOut(BaseModel):
    """
    Représentation d'une société consommable par le frontend.
    """

    id_company: str
    name: str

    # --- Brand (éditorial Ratecard) ---
    description: Optional[str] = None

    # --- Wiki (connaissance structurée simplifiée) ---
    wiki_content: Optional[str] = None
    wiki_source_id: Optional[str] = None
    wiki_updated_at: Optional[datetime] = None
    wiki_vectorised: Optional[bool] = False

    # --- Media ---
    media_logo_url: Optional[str] = None

    # --- Liens ---
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    # --- Statut ---
    is_partner: bool = False

    # --- Dates ---
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    is_active: bool = True
