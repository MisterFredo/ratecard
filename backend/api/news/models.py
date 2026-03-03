from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================

class NewsCreate(BaseModel):
    ID_COMPANY: str = Field(..., alias="id_company")
    NEWS_KIND: str = Field(..., alias="news_kind")
    NEWS_TYPE: Optional[str] = Field(None, alias="news_type")

    TITLE: str = Field(..., alias="title")
    EXCERPT: Optional[str] = Field(None, alias="excerpt")
    BODY: Optional[str] = Field(None, alias="body")

    MEDIA_RECTANGLE_ID: Optional[str] = Field(None, alias="media_rectangle_id")
    SOURCE_URL: Optional[str] = Field(None, alias="source_url")
    AUTHOR: Optional[str] = Field(None, alias="author")

    TOPICS: List[str] = Field(default_factory=list, alias="topics")
    PERSONS: List[str] = Field(default_factory=list, alias="persons")

    CONCEPTS: List[str] = Field(default_factory=list, alias="concepts")
    SOLUTIONS: List[str] = Field(default_factory=list, alias="solutions")

    class Config:
        populate_by_name = True   # accepte MAJUSCULES aussi
        extra = "ignore"          # ne bloque plus si champ en trop
# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================

class NewsUpdate(BaseModel):
    ID_COMPANY: Optional[str] = Field(None, alias="id_company")
    NEWS_KIND: Optional[str] = Field(None, alias="news_kind")
    NEWS_TYPE: Optional[str] = Field(None, alias="news_type")

    TITLE: Optional[str] = Field(None, alias="title")
    EXCERPT: Optional[str] = Field(None, alias="excerpt")
    BODY: Optional[str] = Field(None, alias="body")

    MEDIA_RECTANGLE_ID: Optional[str] = Field(None, alias="media_rectangle_id")
    SOURCE_URL: Optional[str] = Field(None, alias="source_url")
    AUTHOR: Optional[str] = Field(None, alias="author")

    TOPICS: Optional[List[str]] = Field(None, alias="topics")
    PERSONS: Optional[List[str]] = Field(None, alias="persons")

    CONCEPTS: Optional[List[str]] = Field(None, alias="concepts")
    SOLUTIONS: Optional[List[str]] = Field(None, alias="solutions")

    class Config:
        populate_by_name = True
        extra = "ignore"

# ============================================================
# PUBLISH
# ============================================================

class NewsPublish(BaseModel):
    publish_at: Optional[str] = None


# ============================================================
# MINI STRUCTURES — PAGE SIGNAUX
# ============================================================

class CompanyMini(BaseModel):
    id_company: str
    name: str
    is_partner: bool


class TopicMini(BaseModel):
    id_topic: str
    label: str
    axis: Optional[str] = None


class ConceptMini(BaseModel):
    id_concept: str
    title: str


class SolutionMini(BaseModel):
    id_solution: str
    title: str


# ============================================================
# OUT — VERSION LISTING (FLUX UNIQUEMENT)
# ============================================================

class BreveOut(BaseModel):
    id: str
    title: str
    excerpt: Optional[str] = None
    published_at: datetime
    news_type: Optional[str] = None
    news_kind: Optional[str] = None

    company: CompanyMini
    topics: List[TopicMini] = Field(default_factory=list)

    # 🔥 NOUVEAU — TAGGING SOUPLE
    concepts: List[ConceptMini] = Field(default_factory=list)
    solutions: List[SolutionMini] = Field(default_factory=list)


# ============================================================
# STATS — PAGE SIGNAUX
# ============================================================

class BreveCompanyStat(BaseModel):
    id_company: str
    name: str
    is_partner: bool
    total: int
    last_7_days: int
    last_30_days: int


class BreveTopicStat(BaseModel):
    id_topic: str
    label: str
    total: int
    last_7_days: int
    last_30_days: int


class BreveTypeStat(BaseModel):
    news_type: Optional[str] = None
    total: int
    last_7_days: int
    last_30_days: int


# ============================================================
# RESPONSE — SEARCH (FLUX UNIQUEMENT)
# ============================================================

class BrevesSearchResponse(BaseModel):
    total_count: int
    sponsorised: List[BreveOut] = Field(default_factory=list)
    items: List[BreveOut] = Field(default_factory=list)


# ============================================================
# RESPONSE — STATS (FILTRES UNIQUEMENT)
# ============================================================

class BrevesStatsResponse(BaseModel):
    total_count: int
    last_7_days: int
    last_30_days: int

    topics_stats: List[BreveTopicStat] = Field(default_factory=list)
    types_stats: List[BreveTypeStat] = Field(default_factory=list)
    top_companies: List[BreveCompanyStat] = Field(default_factory=list)


# ============================================================
# NEWS TYPE — RÉFÉRENTIEL
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
