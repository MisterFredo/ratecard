from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================
# CREATE — création d'une personne (DATA ONLY)
# ============================================================
class PersonCreate(BaseModel):
    """
    Création d'une personne.

    ⚠️ Aucun champ média ici :
    les visuels sont associés uniquement après création.
    """
    name: str
    id_company: Optional[str] = None

    title: Optional[str] = None
    description: Optional[str] = None
    linkedin_url: Optional[str] = None


# ============================================================
# UPDATE — mise à jour d'une personne existante
# ============================================================
class PersonUpdate(BaseModel):
    """
    Mise à jour d'une personne existante.

    - update partiel
    - champs média autorisés post-création
    """
    name: Optional[str] = None
    id_company: Optional[str] = None

    title: Optional[str] = None
    description: Optional[str] = None
    linkedin_url: Optional[str] = None

    media_picture_square_id: Optional[str] = None
    media_picture_rectangle_id: Optional[str] = None


# ============================================================
# OUT — représentation d'une personne
# ============================================================
class PersonOut(BaseModel):
    """
    Modèle de sortie aligné 1:1 avec RATECARD_PERSON.
    """
    id_person: str
    id_company: Optional[str] = None

    name: str
    title: Optional[str] = None
    description: Optional[str] = None

    media_picture_square_id: Optional[str] = None
    media_picture_rectangle_id: Optional[str] = None

    linkedin_url: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: Optional[bool] = True
