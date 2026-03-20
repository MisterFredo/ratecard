from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# INPUT — SEARCH TEXT
# ============================================================

class SearchTextQuery(BaseModel):
    query: str
    limit: int = 20


# ============================================================
# OUTPUT — ITEM (ALIGNÉ SEARCH + BADGES)
# ============================================================

class FeedItem(BaseModel):
    id: str
    type: str  # "news" | "analysis"

    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None

    # 🔥 BADGES (ENRICHIS BACKEND)
    topics: Optional[List[str]] = None
    companies: Optional[List[str]] = None
    solutions: Optional[List[str]] = None
    news_type: Optional[str] = None


# ============================================================
# OUTPUT — RESPONSE
# ============================================================

class FeedResponse(BaseModel):
    items: List[FeedItem]
    count: int
