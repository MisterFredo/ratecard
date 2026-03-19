from pydantic import BaseModel, Field
from typing import List, Optional


# ============================================================
# INPUT — FEED QUERY (ALIGNÉ API + FRONT)
# ============================================================

class FeedQuery(BaseModel):
    """
    Représente la requête utilisateur côté Curator.
    Aligné avec les query params FastAPI.
    """

    query: Optional[str] = None

    # 🔥 IMPORTANT → alignement backend SQL
    topic_ids: List[str] = Field(default_factory=list)
    company_ids: List[str] = Field(default_factory=list)
    solution_ids: List[str] = Field(default_factory=list)

    types: List[str] = Field(default_factory=list)        # ["news", "analysis"]
    news_types: List[str] = Field(default_factory=list)   # ["PRODUCT", "CORPORATE", ...]

    limit: int = 20
    offset: int = 0


# ============================================================
# OUTPUT — FEED ITEM
# ============================================================

class FeedItem(BaseModel):
    """
    Item unifié (news + analysis)
    utilisé dans le feed Curator.
    """

    id: str
    type: str  # "news" | "analysis"

    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None

    # 🔥 aligné avec service.py
    company_id: Optional[str] = None

    # enrichissements futurs
    company_name: Optional[str] = None

    # visuel (news principalement)
    has_visual: Optional[bool] = None
    media_id: Optional[str] = None

    # spécifique news
    news_type: Optional[str] = None


# ============================================================
# OUTPUT — FEED RESPONSE
# ============================================================

class FeedResponse(BaseModel):
    """
    Réponse standard du feed Curator.
    """

    items: List[FeedItem]
    count: int


# ============================================================
# OUTPUT — META (COCKPIT)
# ============================================================

class MetaItem(BaseModel):
    id: str
    label: str
    count: int


class FeedMetaResponse(BaseModel):
    """
    Structure cockpit pour les filtres dynamiques.
    """

    topics: List[MetaItem]
    companies: List[MetaItem]
    solutions: List[MetaItem]
    news_types: List[MetaItem]
