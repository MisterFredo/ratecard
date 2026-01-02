from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE — création d'une société (DATA ONLY)
# ============================================================
class CompanyCreate(BaseModel):
    """
    Modèle utilisé UNIQUEMENT à la création d'une société.

    ⚠️ AUCUN champ média ici :
    les visuels sont associés uniquement après création.
    """
    name: str
    description: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None


# ============================================================
# UPDATE — mise à jour d'une société existante
# ============================================================
class CompanyUpdate(BaseModel):
    """
    Modèle utilisé pour la mise à jour d'une société existante.

    Les champs sont tous optionnels.
    Les champs média sont autorisés ici (post-création).
    """
    name: Optional[str] = None
    description: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    media_logo_square_id: Optional[str] = None
    media_logo_rectangle_id: Optional[str] = None


# ============================================================
# OUT — représentation d'une société
# ============================================================
class CompanyOut(BaseModel):
    """
    Modèle de sortie représentant l'état d'une société.
    Aligné 1:1 avec la table RATECARD_COMPANY.
    """
    id_company: str
    name: str
    description: Optional[str] = None

    media_logo_square_id: Optional[str] = None
    media_logo_rectangle_id: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: Optional[bool] = True
