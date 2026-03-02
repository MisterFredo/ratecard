from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================================
# WIKI BLOCK STRUCTURE
# ============================================================
class WikiBlock(BaseModel):
    title: Optional[str] = None
    icon: Optional[str] = None
    content: Optional[str] = None


# ============================================================
# CREATE — création d'une société (DATA ONLY)
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
# UPDATE — mise à jour d'une société existante (DATA ONLY)
# ============================================================
class CompanyUpdate(BaseModel):
    """
    Mise à jour des données métier.
    ⚠️ Les visuels sont gérés exclusivement
    via /visuals/company/*
    """
    name: Optional[str] = None
    description: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    is_partner: Optional[bool] = None


# ============================================================
# OUT — représentation frontend-ready
# ============================================================
class CompanyOut(BaseModel):
    """
    Représentation d'une société consommable par le frontend.
    Les URLs sont prêtes à l'emploi.
    """
    id_company: str
    name: str

    # --- ÉDITORIAL RATECARD ---
    description: Optional[str] = None

    # --- WIKI (connaissance structurée) ---
    wiki_description: Optional[str] = None
    wiki_blocks: Optional[List[WikiBlock]] = None
    wiki_source_id: Optional[str] = None
    wiki_updated_at: Optional[datetime] = None
    wiki_vectorised: Optional[bool] = False

    # 🔑 LOGO — URL PUBLIQUE (source de vérité)
    media_logo_url: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    is_partner: bool = False

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: bool = True
