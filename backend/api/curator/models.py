from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# INPUT — SEARCH
# ============================================================

class SearchTextQuery(BaseModel):
    query: str
    limit: int = 20


# ============================================================
# BADGES STRUCTURÉS (ALIGNÉS BQ)
# ============================================================

class Topic(BaseModel):
    id_topic: str
    label: str
    axis: Optional[str] = None


class Company(BaseModel):
    id_company: str
    name: str


class Solution(BaseModel):
    id_solution: str
    name: str


# ============================================================
# OUTPUT — FEED ITEM
# ============================================================

class FeedItem(BaseModel):
    id: str
    type: str  # "news" | "analysis"

    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None

    # 🔥 BADGES STRUCTURÉS
    topics: List[Topic] = []
    companies: List[Company] = []
    solutions: List[Solution] = []

    # spécifique news
    news_type: Optional[str] = None


# ============================================================
# OUTPUT — RESPONSE
# ============================================================

class FeedResponse(BaseModel):
    items: List[FeedItem]
    count: int
