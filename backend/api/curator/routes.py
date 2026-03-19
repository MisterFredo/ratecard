from pydantic import BaseModel, Field
from typing import List, Optional


# ============================================================
# INPUT — QUERY (COMMUNE)
# ============================================================

class FeedQuery(BaseModel):
    """
    Requête utilisée pour news ET content.
    """

    query: Optional[str] = None

    topic_ids: List[str] = Field(default_factory=list)
    company_ids: List[str] = Field(default_factory=list)
    solution_ids: List[str] = Field(default_factory=list)

    # 🔥 spécifique NEWS uniquement
    news_types: List[str] = Field(default_factory=list)

    limit: int = 20
    offset: int = 0


# ============================================================
# BASE ITEM (COMMUN)
# ============================================================

class BaseItem(BaseModel):
    id: str

    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None

    company_id: Optional[str] = None
    company_name: Optional[str] = None


# ============================================================
# NEWS ITEM
# ============================================================

class NewsItem(BaseItem):
    type: str = "news"

    news_type: Optional[str] = None

    has_visual: Optional[bool] = None
    media_id: Optional[str] = None


# ============================================================
# CONTENT ITEM (ANALYSIS)
# ============================================================

class ContentItem(BaseItem):
    type: str = "analysis"


# ============================================================
# RESPONSES SÉPARÉES
# ============================================================

class NewsResponse(BaseModel):
    items: List[NewsItem]
    count: int


class ContentResponse(BaseModel):
    items: List[ContentItem]
    count: int


# ============================================================
# FORMAT UNIFIÉ (FRONT UNIQUEMENT)
# ============================================================

class FeedItem(BaseModel):
    """
    Format utilisé si tu merges côté front
    """

    id: str
    type: str  # "news" | "analysis"

    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None

    company_id: Optional[str] = None
    company_name: Optional[str] = None

    # spécifique news (optionnel)
    news_type: Optional[str] = None
    has_visual: Optional[bool] = None
    media_id: Optional[str] = None


class FeedResponse(BaseModel):
    """
    OPTIONNEL : si tu veux renvoyer un feed mixé
    """
    items: List[FeedItem]
    count: int


# ============================================================
# META (FILTRES)
# ============================================================

class MetaItem(BaseModel):
    id: str
    label: str
    count: int


class FeedMetaResponse(BaseModel):
    topics: List[MetaItem]
    companies: List[MetaItem]
    solutions: List[MetaItem]
    news_types: List[MetaItem]
