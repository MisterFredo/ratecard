from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# INPUT — FEED QUERY
# ============================================================

class FeedQuery(BaseModel):
    """
    Représente la requête utilisateur côté Curator.
    Aligné 1:1 avec l’UI (search + filtres).
    """

    query: Optional[str] = None

    topics: List[str] = []
    companies: List[str] = []
    solutions: List[str] = []

    types: List[str] = []          # ["news", "analysis"]
    news_types: List[str] = []     # ["PRODUCT", "CORPORATE", ...]

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

    # Company (principalement pour news)
    company: Optional[str] = None

    # Visuel (uniquement news pour l’instant)
    has_visual: Optional[bool] = None
    media_id: Optional[str] = None

    # Spécifique news
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
