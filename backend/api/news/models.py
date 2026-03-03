from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================

class NewsCreate(BaseModel):
    ID_COMPANY: str
    NEWS_KIND: str
    NEWS_TYPE: Optional[str] = None

    TITLE: str
    EXCERPT: Optional[str] = None
    BODY: Optional[str] = None

    MEDIA_RECTANGLE_ID: Optional[str] = None
    SOURCE_URL: Optional[str] = None
    AUTHOR: Optional[str] = None

    TOPICS: List[str] = Field(default_factory=list)
    PERSONS: List[str] = Field(default_factory=list)

    CONCEPTS: List[str] = Field(default_factory=list)
    SOLUTIONS: List[str] = Field(default_factory=list)

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================

class NewsUpdate(BaseModel):
    ID_COMPANY: Optional[str] = None
    NEWS_KIND: Optional[str] = None
    NEWS_TYPE: Optional[str] = None

    TITLE: Optional[str] = None
    EXCERPT: Optional[str] = None
    BODY: Optional[str] = None

    MEDIA_RECTANGLE_ID: Optional[str] = None
    SOURCE_URL: Optional[str] = None
    AUTHOR: Optional[str] = None

    TOPICS: Optional[List[str]] = None
    PERSONS: Optional[List[str]] = None

    CONCEPTS: Optional[List[str]] = None
    SOLUTIONS: Optional[List[str]] = None

    class Config:
        extra = "forbid"


# ============================================================
# PUBLISH
# ============================================================

class NewsPublish(BaseModel):
    publish_at: Optional[datetime] = None


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
# OUT — VERSION LISTING (FLUX)
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
# RESPONSE — SEARCH
# ============================================================

class BrevesSearchResponse(BaseModel):
    total_count: int = 0
    sponsorised: List[BreveOut] = Field(default_factory=list)
    items: List[BreveOut] = Field(default_factory=list)


# ============================================================
# RESPONSE — STATS
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
