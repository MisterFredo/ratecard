from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================
class NewsCreate(BaseModel):
    # --------------------------------------------------------
    # SOCIÉTÉ
    # --------------------------------------------------------
    id_company: str

    # --------------------------------------------------------
    # STRUCTURE ÉDITORIALE (FORMAT)
    # --------------------------------------------------------
    # NEWS | BRIEF
    news_kind: str

    # --------------------------------------------------------
    # CATÉGORIE RÉDACTIONNELLE (GOUVERNÉE BQ)
    # ex: CORPORATE, PARTENAIRE, EVENT, etc.
    # --------------------------------------------------------
    news_type: Optional[str] = None

    # --------------------------------------------------------
    # CONTENU
    # --------------------------------------------------------
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    # --------------------------------------------------------
    # VISUEL / META
    # --------------------------------------------------------
    media_rectangle_id: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None

    # --------------------------------------------------------
    # ENRICHISSEMENTS
    # --------------------------------------------------------
    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================
class NewsUpdate(BaseModel):
    # --------------------------------------------------------
    # STRUCTURE ÉDITORIALE
    # --------------------------------------------------------
    # NEWS | BRIEF
    news_kind: Optional[str] = None

    # --------------------------------------------------------
    # CATÉGORIE RÉDACTIONNELLE
    # --------------------------------------------------------
    news_type: Optional[str] = None

    # --------------------------------------------------------
    # CONTENU
    # --------------------------------------------------------
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    # --------------------------------------------------------
    # VISUEL / META
    # --------------------------------------------------------
    media_rectangle_id: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None

    # --------------------------------------------------------
    # ENRICHISSEMENTS
    # --------------------------------------------------------
    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# PUBLISH
# ============================================================
class NewsPublish(BaseModel):
    publish_at: Optional[str] = None


# ============================================================
# OUT — NEWS / BRÈVE (ADMIN / API)
# ============================================================
class NewsOut(BaseModel):
    id_news: str
    status: str

    # --------------------------------------------------------
    # STRUCTURE
    # --------------------------------------------------------
    news_kind: Optional[str]      # NEWS | BRIEF
    news_type: Optional[str]      # CORPORATE | PARTENAIRE | ...

    # --------------------------------------------------------
    # CONTENU
    # --------------------------------------------------------
    title: str
    excerpt: Optional[str]
    body: Optional[str]

    # --------------------------------------------------------
    # PUBLICATION
    # --------------------------------------------------------
    published_at: Optional[datetime]

    # --------------------------------------------------------
    # RELATIONS
    # --------------------------------------------------------
    company: dict
    topics: list = []
    persons: list = []


# ============================================================
# NEWS TYPE (RÉFÉRENTIEL GOUVERNÉ)
# ============================================================
class NewsTypeOut(BaseModel):
    code: str
    label: str


class NewsTypeListResponse(BaseModel):
    types: List[NewsTypeOut]


# ============================================================
# LINKEDIN
# ============================================================
class NewsLinkedInPost(BaseModel):
    text: str
    mode: str  # "manual" | "ai"


class NewsLinkedInPostResponse(BaseModel):
    text: Optional[str] = None
    mode: Optional[str] = None
