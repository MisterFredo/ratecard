from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ============================================================
# RELATION PERSONNE DANS UN ARTICLE
# ============================================================

class ArticlePerson(BaseModel):
    id_person: str
    role: Optional[str] = None


# ============================================================
# ARTICLE CREATE — validation d’un draft
# ============================================================
class ArticleCreate(BaseModel):
    """
    Création d’un Article à partir d’un draft validé.

    Règles :
    - titre obligatoire
    - contenu HTML obligatoire
    - au moins 1 topic obligatoire
    - visuel NON obligatoire à la création

    L’article est la référence éditoriale unique.
    Les exploitations (LinkedIn, newsletter, etc.)
    sont gérées hors de ce modèle.
    """

    # CONTENU ÉDITORIAL
    title: str
    content_html: str

    # ACCROCHE & CONCLUSION
    excerpt: Optional[str] = None
    outro: Optional[str] = None

    # RELATIONS
    topics: List[str] = Field(default_factory=list)     # ID_TOPIC (>=1 requis côté service)
    companies: List[str] = Field(default_factory=list)  # ID_COMPANY
    persons: List[ArticlePerson] = Field(default_factory=list)

    # META
    author: Optional[str] = None


# ============================================================
# ARTICLE UPDATE — remplacement complet
# ============================================================
class ArticleUpdate(BaseModel):
    """
    Mise à jour complète d’un Article existant.
    (remplacement total, pas d’update partiel)
    """

    # CONTENU ÉDITORIAL
    title: str
    content_html: str

    # ACCROCHE & CONCLUSION
    excerpt: Optional[str] = None
    outro: Optional[str] = None

    # VISUEL (propriété de l’article)
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    # RELATIONS
    topics: List[str] = Field(default_factory=list)
    companies: List[str] = Field(default_factory=list)
    persons: List[ArticlePerson] = Field(default_factory=list)

    # META
    author: Optional[str] = None


# ============================================================
# ARTICLE OUT — représentation enrichie
# ============================================================
class ArticleOut(BaseModel):
    """
    Représentation complète d’un Article
    pour l’admin, la preview et le front public.
    """

    id_article: str

    # CONTENU ÉDITORIAL
    title: str
    content_html: str
    excerpt: Optional[str] = None
    outro: Optional[str] = None

    # VISUELS
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    # META
    author: Optional[str] = None
    status: str                     # DRAFT | SCHEDULED | PUBLISHED | ARCHIVED
    published_at: Optional[datetime]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    # RELATIONS ENRICHIES
    topics: List[dict] = []
    companies: List[dict] = []
    persons: List[dict] = []
