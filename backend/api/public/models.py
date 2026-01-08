from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime


# -------------------------------------------------------
# HOME — CONTINUOUS BAND
# -------------------------------------------------------
class HomeContinuousItem(BaseModel):
    type: Literal["news", "content"]
    id: str
    title: str
    published_at: datetime


class HomeContinuousResponse(BaseModel):
    items: List[HomeContinuousItem]


# -------------------------------------------------------
# HOME — NEWS BLOCK
# -------------------------------------------------------
class HomeNewsItem(BaseModel):
    id: str
    title: str
    excerpt: str | None
    published_at: datetime
    visual_rect_url: str


class HomeNewsResponse(BaseModel):
    items: List[HomeNewsItem]


# -------------------------------------------------------
# HOME — EVENTS BLOCKS
# -------------------------------------------------------
class HomeEventInfo(BaseModel):
    id: str
    label: str
    home_label: str
    visual_rect_url: str


class HomeEventContentItem(BaseModel):
    id: str
    title: str
    excerpt: str
    published_at: datetime


class HomeEventBlock(BaseModel):
    event: HomeEventInfo
    contents: List[HomeEventContentItem]


class HomeEventsResponse(BaseModel):
    events: List[HomeEventBlock]
