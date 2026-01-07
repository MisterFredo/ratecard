from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE
# ============================================================
class NewsCreate(BaseModel):
    id_company: str

    title: str
    body: Optional[str] = None

    media_rectangle_id: str   # obligatoire

    source_url: Optional[str] = None
    author: Optional[str] = None

    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# UPDATE
# ============================================================
class NewsUpdate(BaseModel):
    title: str
    body: Optional[str] = None

    media_rectangle_id: Optional[str] = None

    source_url: Optional[str] = None
    author: Optional[str] = None

    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# OUT
# ============================================================
class NewsOut(BaseModel):
    id_news: str
    status: str

    title: str
    body: Optional[str]

    published_at: Optional[datetime]

    company: dict
    topics: list = []
    persons: list = []
