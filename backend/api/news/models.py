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
    id_company: str = Field(..., alias="idCompany")

    # --------------------------------------------------------
    # STRUCTURE ÉDITORIALE (FORMAT)
    # NEWS | BRIEF
    # --------------------------------------------------------
    news_kind: str = Field(..., alias="newsKind")

    # --------------------------------------------------------
    # CATÉGORIE RÉDACTIONNELLE (GOUVERNÉE BQ)
    # ex: CORPORATE, PARTENAIRE, EVENT, etc.
    # --------------------------------------------------------
    news_type: Optional[str] = Field(None, alias="newsType")

    # --------------------------------------------------------
    # CONTENU
    # --------------------------------------------------------
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    # --------------------------------------------------------
    # VISUEL / META
    # --------------------------------------------------------
    media_rectangle_id: Optional[str] = Field(
        None, alias="mediaRectangleId"
    )
    source_url: Optional[str] = Field(None, alias="sourceUrl")
    author: Optional[str] = None

    # --------------------------------------------------------
    # ENRICHISSEMENTS
    # --------------------------------------------------------
    topics: List[str] = []
    persons: List[str] = []

    class Config:
        allow_population_by_field_name = True
        extra = "forbid"


# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================
class NewsUpdate(BaseModel):
    # --------------------------------------------------------
    # STRUCTURE ÉDITORIALE
    # --------------------------------------------------------
    news_kind: Optional[str] = Field(None, alias="newsKind")

    # --------------------------------------------------------
    # CATÉGORIE RÉDACTIONNELLE
    # --------------------------------------------------------
    news_type: Optional[str] = Field(None, alias="newsType")

    # --------------------------------------------------------
    # CONTENU
    # --------------------------------------------------------
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    # --------------------------------------------------------
    # VISUEL / META
    # --------------------------------------------------------
    media_rectangle_id: Optional[str] = Field(
        None, alias="mediaRectangleId"
    )
    source_url: Optional[str] = Field(None, alias="sourceUrl")
    author: Optional[str] = None

    # --------------------------------------------------------
    # ENRICHISSEMENTS
    # --------------------------------------------------------
    topics: List[str] = []
    persons: List[str] = []

    class Config:
        allow_population_by_field_name = True
        extra = "forbid"


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
