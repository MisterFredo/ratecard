from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class FeedItem(BaseModel):
    id: str
    title: str
    excerpt: Optional[str]
    signal: Optional[str]
    concept: Optional[str]
    published_at: datetime


class FeedResponse(BaseModel):
    items: List[FeedItem]


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
    published_at: datetime

    topics: List[dict]
    companies: List[dict]
    solutions: List[dict]
