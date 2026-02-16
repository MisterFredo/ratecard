from pydantic import BaseModel, Field
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
    # ENRICHISSEMENTS (IDs UNIQUEMENT)
    # --------------------------------------------------------
    topics: List[str] = Field(default_factory=list)
    persons: List[str] = Field(default_factory=list)

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================
class NewsUpdate(BaseModel):
    # --------------------------------------------------------
    # SOCIÉTÉ
    # --------------------------------------------------------
    id_company: Optional[str] = None

    # --------------------------------------------------------
    # STRUCTURE
    # --------------------------------------------------------
    news_kind: Optional[str] = None
    news_type: Optional[str] = None

    # --------------------------------------------------------
    # CONTENU
    # --------------------------------------------------------
    title: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None

    # --------------------------------------------------------
    # VISUEL / META
    # --------------------------------------------------------
    media_rectangle_id: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None

    # --------------------------------------------------------
    # RELATIONS
    # --------------------------------------------------------
    topics: Optional[List[str]] = None
    persons: Optional[List[str]] = None

    class Config:
        extra = "ignore"



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

    # STRUCTURE
    news_kind: Optional[str]
    news_type: Optional[str]

    # CONTENU
    title: str
    excerpt: Optional[str]
    body: Optional[str]

    # PUBLICATION
    published_at: Optional[datetime]

    # RELATIONS
    company: dict
    topics: List[dict] = Field(default_factory=list)
    persons: List[dict] = Field(default_factory=list)

    class Config:
        extra = "ignore"


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
