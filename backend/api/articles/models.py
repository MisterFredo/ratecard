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
    """

    # CONTENU PRINCIPAL
    title: str
    content_html: str

    # VARIANTES ÉDITORIALES
    excerpt: Optional[str] = None
    intro: Optional[str] = None
    outro: Optional[str] = None

    linkedin_post_text: Optional[str] = None
    carousel_caption: Optional[str] = None

    # RELATIONS
    topics: List[str] = Field(default_factory=list)     # ID_TOPIC (>= 1 requis côté service)
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
    (pas d’update partiel)
    """

    # CONTENU PRINCIPAL
    title: str
    content_html: str

    # VARIANTES ÉDITORIALES
    excerpt: Optional[str] = None
    intro: Optional[str] = None
    outro: Optional[str] = None

    linkedin_post_text: Optional[str] = None
    carousel_caption: Optional[str] = None

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
    Représentation complète d’un Article pour l’admin & le front.
    """

    id_article: str

    title: str
    content_html: str

    excerpt: Optional[str] = None
    intro: Optional[str] = None
    outro: Optional[str] = None

    linkedin_post_text: Optional[str] = None
    carousel_caption: Optional[str] = None

    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    author: Optional[str] = None

    status: str                     # DRAFT | PUBLISHED
    published_at: Optional[datetime]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    # RELATIONS ENRICHIES
    topics: List[dict] = []
    companies: List[dict] = []
    persons: List[dict] = []
