# backend/api/articles/models.py

from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# PERSON & COMPANY linking models
# ============================================================

class ArticlePerson(BaseModel):
    id_person: str
    role: Optional[str] = None


# ============================================================
# CREATE ARTICLE — utilisé pour POST /articles/create
# ============================================================
class ArticleCreate(BaseModel):
    # TEXTE
    titre: str
    resume: str                          # Texte libre, sera affiché comme accroche
    contenu_html: str                    # HTML final (converti côté front)

    # VISUEL (1 seul visuel final, rectangle & square sont dérivés)
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    # AUTEUR
    auteur: Optional[str] = None

    # AXES (1..N)
    axes: List[str] = []                 # liste d'ID_AXE

    # SOCIÉTÉS (0..N)
    companies: List[str] = []            # liste d'ID_COMPANY

    # PERSONNES (0..N)
    persons: List[ArticlePerson] = []    # liste complète {id_person, role}

    # OPTIONS (homepage)
    is_featured: bool = False
    featured_order: Optional[int] = None


# ============================================================
# UPDATE ARTICLE — utilisé pour PUT /articles/update/{id}
# ============================================================
class ArticleUpdate(BaseModel):
    # TEXTE
    titre: str
    resume: str
    contenu_html: str

    # VISUEL final
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    auteur: Optional[str] = None

    # AXES / COMPAGNIES / PERSONNES
    axes: List[str] = []
    companies: List[str] = []
    persons: List[ArticlePerson] = []

    # Options
    is_featured: bool = False
    featured_order: Optional[int] = None
