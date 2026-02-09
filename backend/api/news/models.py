from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime


# ============================================================
# TYPES
# ============================================================

NewsType = Literal["NEWS", "BRIEF"]


# ============================================================
# CREATE NEWS / BRIEF
# ============================================================
class NewsCreate(BaseModel):
    # TYPE DE CONTENU
    news_type: NewsType = "NEWS"

    # SOCIÉTÉ (OBLIGATOIRE)
    id_company: str

    # CONTENU
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None  # facultatif pour BRIEF

    # VISUEL
    media_rectangle_id: Optional[str] = None  # requis uniquement pour NEWS

    # META
    source_url: Optional[str] = None
    author: Optional[str] = None

    # ENRICHISSEMENTS LÉGERS
    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# UPDATE NEWS / BRIEF
# ============================================================
class NewsUpdate(BaseModel):
    # TYPE (modifiable si besoin)
    news_type: Optional[NewsType] = None

    title: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None

    media_rectangle_id: Optional[str] = None

    source_url: Optional[str] = None
    author: Optional[str] = None

    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# PUBLISH
# ============================================================
class NewsPublish(BaseModel):
    """
    Payload de publication d'une news ou d'une brève.
    """
    publish_at: Optional[str] = None


# ============================================================
# OUT (ADMIN / API)
# ============================================================
class NewsOut(BaseModel):
    id_news: str
    status: str

    news_type: NewsType

    title: str
    excerpt: Optional[str]
    body: Optional[str]

    published_at: Optional[datetime]

    company: dict
    topics: list = []
    persons: list = []


# ============================================================
# LINKEDIN — POST LIÉ À UNE NEWS
# (BRIEF exclue plus tard côté logique métier)
# ============================================================
class NewsLinkedInPost(BaseModel):
    text: str
    mode: str  # "manual" | "ai"


class NewsLinkedInPostResponse(BaseModel):
    text: Optional[str] = None
    mode: Optional[str] = None
