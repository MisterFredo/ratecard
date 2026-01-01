# backend/api/articles/models.py

from pydantic import BaseModel, Field
from typing import List, Optional


# ============================================================
# RELATIONS
# ============================================================

class ArticleCompanyRef(BaseModel):
    """Référence simple vers une société associée à l’article."""
    id_company: str


class ArticlePersonRef(BaseModel):
    """Référence vers une personne associée à l’article."""
    id_person: str
    role: Optional[str] = None   # Optionnel (ex : auteur, intervenant…)


class ArticleAxeRef(BaseModel):
    """Axe éditorial associé à l’article."""
    id_axe: str
    label: Optional[str] = None   # facultatif, utile pour affichage front


# ============================================================
# CRÉATION D'ARTICLE
# ============================================================

class ArticleCreate(BaseModel):
    """
    Modèle utilisé pour créer / mettre à jour un article.
    - L’utilisateur saisit du texte brut → rendu HTML côté front.
    - Les visuels sont gérés via le module VISUALS.
    """

    # --- Champs éditoriaux ---
    titre: str = Field(..., description="Titre principal de l’article")
    resume: Optional[str] = Field(None, description="Résumé utilisé comme accroche newsletter / home")
    contenu_html: Optional[str] = Field(None, description="Contenu final HTML")

    # --- Relations ---
    companies: List[str] = Field(default_factory=list)   # 0..N
    persons: List[ArticlePersonRef] = Field(default_factory=list)  # 0..N
    axes: List[str] = Field(..., min_length=1, description="Liste des axes éditoriaux (1..N)")

    # --- Visuels Article ---
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    # --- Métadonnées ---
    auteur: Optional[str] = None
    is_featured: bool = False
    featured_order: Optional[int] = None


# ============================================================
# LECTURE / MISE À JOUR
# ============================================================

class ArticleUpdate(ArticleCreate):
    """
    Identique à ArticleCreate mais utilisé pour update.
    Rien à changer pour le moment.
    """
    pass


# ============================================================
# DTO Retour API
# ============================================================

class ArticleFront(BaseModel):
    """
    Format renvoyé au front :
    - metadata
    - relations enrichies
    - visuels
    """

    id_article: str
    titre: str
    resume: Optional[str]
    contenu_html: Optional[str]

    # Relations enrichies
    companies: List[dict]
    persons: List[dict]
    axes: List[dict]

    # Visuels GCS directs
    media_rectangle_url: Optional[str]
    media_square_url: Optional[str]

    auteur: Optional[str]
    created_at: str
    updated_at: str
    is_featured: bool
    featured_order: Optional[int]
    is_archived: bool
