from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# =======================================================
# HOME — NEWS (CARTES)
# =======================================================
class HomeNewsItem(BaseModel):
    id: str
    title: str
    excerpt: Optional[str]
    published_at: datetime
    visual_rect_url: str


class HomeNewsResponse(BaseModel):
    items: List[HomeNewsItem]


# =======================================================
# HOME — ANALYSES (LIGNES PAR EVENT)
# =======================================================
class HomeEventInfo(BaseModel):
    id: str
    label: str
    home_label: str
    event_color: Optional[str] = None


class HomeAnalysisLine(BaseModel):
    id: str
    title: str
    published_at: datetime
    topics: Optional[List[str]] = None
    key_metrics: Optional[List[str]] = None


class HomeEventBlock(BaseModel):
    event: HomeEventInfo
    analyses: List[HomeAnalysisLine]


class HomeEventsResponse(BaseModel):
    events: List[HomeEventBlock]


# =======================================================
# DRAWER — NEWS
# =======================================================
class DrawerNewsResponse(BaseModel):
    id_news: str
    title: str
    excerpt: Optional[str]
    body: Optional[str]
    published_at: datetime
    visual_rect_url: str
    company: dict


# =======================================================
# DRAWER — ANALYSE
# =======================================================
class DrawerAnalysisResponse(BaseModel):
    id_content: str
    angle_title: str
    angle_signal: str
    excerpt: Optional[str]
    concept: Optional[str]
    content_body: Optional[str]
    chiffres: List[str]
    citations: List[str]
    acteurs_cites: List[str]
    published_at: datetime
    event: Optional[dict]


