from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================
class NewsCreate(BaseModel):
    # SOCIÉTÉ
    id_company: str

    # CONTENU
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    # STRUCTURE ÉDITORIALE
    # NEWS = article éditorial complet
    # BRIEF = signal court (titre + excerpt)
    news_type: str  # "NEWS" | "BRIEF"

    # CATÉGORIE MÉTIER
    # ex: "partenariat" | "produit" | "client" | "corporate" | ...
    type: Optional[str] = None

    # VISUEL / META
    media_rectangle_id: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None

    # ENRICHISSEMENTS
    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================
class NewsUpdate(BaseModel):
    # STRUCTURE ÉDITORIALE
    news_type: Optional[str] = None  # "NEWS" | "BRIEF"

    # CATÉGORIE MÉTIER
    type: Optional[str] = None

    # CONTENU
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    # VISUEL / META
    media_rectangle_id: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None

    # ENRICHISSEMENTS
    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# PUBLISH
# ============================================================
class NewsPublish(BaseModel):
    publish_at: Optional[str] = None


# ============================================================
# OUT (ADMIN / API)
# ============================================================
class NewsOut(BaseModel):
    id_news: str
    status: str

    # STRUCTURE
    news_type: Optional[str]  # "NEWS" | "BRIEF"
    type: Optional[str]       # "partenariat" | "produit" | ...

    # CONTENU
    title: str
    excerpt: Optional[str]
    body: Optional[str]

    published_at: Optional[datetime]

    company: dict
    topics: list = []
    persons: list = []


# ============================================================
# LINKEDIN
# ============================================================
class NewsLinkedInPost(BaseModel):
    text: str
    mode: str  # "manual" | "ai"


class NewsLinkedInPostResponse(BaseModel):
    text: Optional[str] = None
    mode: Optional[str] = None
