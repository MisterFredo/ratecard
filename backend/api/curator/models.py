from pydantic import BaseModel, Field
from typing import List, Optional


# ============================================================
# INPUT — FEED QUERY
# ============================================================

class FeedQuery(BaseModel):
    """
    Requête utilisateur Curator.
    Utilisée pour news ET content.
    """

    query: Optional[str] = None

    topic_ids: List[str] = Field(default_factory=list)
    company_ids: List[str] = Field(default_factory=list)
    solution_ids: List[str] = Field(default_factory=list)

    # 🔥 uniquement pour NEWS
    news_types: List[str] = Field(default_factory=list)

    limit: int = 20
    offset: int = 0


# ============================================================
# OUTPUT — BASE ITEM (COMMUN)
# ============================================================

class BaseItem(BaseModel):
    id: str
    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None

    company_id: Optional[str] = None
    company_name: Optional[str] = None


# ============================================================
# OUTPUT — NEWS
# ============================================================

class NewsItem(BaseItem):
    type: str = "news"

    news_type: Optional[str] = None

    has_visual: Optional[bool] = None
    media_id: Optional[str] = None


# ============================================================
# OUTPUT — ANALYSIS
# ============================================================

class ContentItem(BaseItem):
    type: str = "analysis"


# ============================================================
# OUTPUT — RESPONSES
# ============================================================

class NewsResponse(BaseModel):
    items: List[NewsItem]
    count: int


class ContentResponse(BaseModel):
    items: List[ContentItem]
    count: int


# ============================================================
# OUTPUT — UNIFIED (OPTIONNEL FRONT)
# ============================================================

class FeedItem(BaseModel):
    """
    Format unifié pour le front (merge possible)
    """

    id: str
    type: str  # "news" | "analysis"

    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None

    company_id: Optional[str] = None
    company_name: Optional[str] = None

    news_type: Optional[str] = None
    has_visual: Optional[bool] = None
    media_id: Optional[str] = None


class FeedResponse(BaseModel):
    """
    Utilisé uniquement si tu veux un feed mixé
    (facultatif)
    """
    items: List[FeedItem]
    count: int


# ============================================================
# META (COCKPIT)
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
