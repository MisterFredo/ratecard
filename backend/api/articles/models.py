# backend/api/articles/models.py

from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# AXES / PERSONS / COMPANIES RELATIONS
# ============================================================

class ArticlePerson(BaseModel):
    id_person: str
    role: Optional[str] = None


# ============================================================
# ARTICLE CREATE
# ============================================================
class ArticleCreate(BaseModel):
    titre: str
    resume: Optional[str] = None
    contenu_html: str

    # MEDIA (IDs BQ du DAM)
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    # RELATIONS
    axes: List[str] = []           # liste des ID_AXE
    companies: List[str] = []      # liste des ID_COMPANY
    persons: List[ArticlePerson] = []

    # Auteur
    auteur: Optional[str] = None

    # Mise en avant
    is_featured: bool = False
    featured_order: Optional[int] = None


# ============================================================
# ARTICLE UPDATE
# ============================================================
class ArticleUpdate(BaseModel):
    titre: str
    resume: Optional[str] = None
    contenu_html: str

    # MEDIA
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    # RELATIONS
    axes: List[str] = []
    companies: List[str] = []
    persons: List[ArticlePerson] = []

    auteur: Optional[str] = None
    is_featured: bool = False
    featured_order: Optional[int] = None
