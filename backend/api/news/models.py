from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================

class NewsCreate(BaseModel):
    id_company: str
    news_kind: str  # NEWS | BRIEF
    news_type: Optional[str] = None

    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    media_rectangle_id: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None

    topics: List[str] = Field(default_factory=list)
    persons: List[str] = Field(default_factory=list)

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================

class NewsUpdate(BaseModel):
    id_company: Optional[str] = None
    news_kind: Optional[str] = None
    news_type: Optional[str] = None

    title: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None

    media_rectangle_id: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None

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
# STRUCTURES SIMPLIFIÉES POUR PAGE BRÈVES
# ============================================================

class CompanyMini(BaseModel):
    id_company: str
    name: str
    is_partner: bool


class TopicMini(BaseModel):
    id_topic: Optional[str] = None
    label: str
    axis: Optional[str] = None


# ============================================================
# OUT — VERSION BRÈVE (MOTEUR)
# ============================================================

class BreveOut(BaseModel):
    id: str
    title: str
    excerpt: Optional[str]
    published_at: datetime
    news_type: Optional[str]
    company: CompanyMini
    topics: List[TopicMini]

# ============================================================
# STATS — PAGE BRÈVES
# ============================================================

class BreveCompanyStat(BaseModel):
    id_company: str
    name: str
    is_partner: bool
    total_count: int


class BreveTopicStat(BaseModel):
    id_topic: str
    label: str
    total_count: int


class BreveTypeStat(BaseModel):
    news_type: Optional[str]
    total_count: int


# ============================================================
# RESPONSE — PAGE BRÈVES
# ============================================================

class BrevesSearchResponse(BaseModel):
    total_count: int

    sponsorised: List[BreveOut] = Field(default_factory=list)
    items: List[BreveOut] = Field(default_factory=list)

    topics_stats: List[BreveTopicStat] = Field(default_factory=list)
    types_stats: List[BreveTypeStat] = Field(default_factory=list)
    top_companies: List[BreveCompanyStat] = Field(default_factory=list)


# ============================================================
# NEWS TYPE (RÉFÉRENTIEL)
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
    mode: str


class NewsLinkedInPostResponse(BaseModel):
    text: Optional[str] = None
    mode: Optional[str] = None
