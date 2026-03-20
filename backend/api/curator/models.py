from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# INPUT — SEARCH TEXT
# ============================================================

class SearchTextQuery(BaseModel):
    query: str
    limit: int = 20


# ============================================================
# OUTPUT — ITEM (ALIGNÉ SEARCH)
# ============================================================

class FeedItem(BaseModel):
    id: str
    type: str  # "news" | "analysis"

    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None


# ============================================================
# OUTPUT — RESPONSE
# ============================================================

class FeedResponse(BaseModel):
    items: List[FeedItem]
    count: int
