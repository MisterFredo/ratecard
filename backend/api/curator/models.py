from pydantic import BaseModel
from typing import List, Optional


class FeedItem(BaseModel):
    id: str
    type: str  # "news" | "analysis"
    title: str
    excerpt: Optional[str]
    signal: Optional[str]
    concept: Optional[str]
    published_at: Optional[str]

    company: Optional[str] = None


class FeedResponse(BaseModel):
    items: List[FeedItem]
    total: int


class ContentDetail(BaseModel):
    id_content: str
    title: str
    signal: Optional[str]
    excerpt: Optional[str]
    concept: Optional[str]
    content_body: Optional[str]
    chiffres: List[str]
    citations: List[str]
    acteurs_cites: List[str]
    published_at: Optional[str]

    topics: List[dict] = []
    companies: List[dict] = []
    solutions: List[dict] = []
