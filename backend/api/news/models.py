from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================
class NewsCreate(BaseModel):
    id_company: str

    title: str
    body: Optional[str] = None
    excerpt: Optional[str] = None

    # 🆕
    news_type: str  # "NEWS" | "BRIEF"
    type: Optional[str] = None  # "partenariat" | "produit" | ...

    media_rectangle_id: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None

    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []



# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================
class NewsUpdate(BaseModel):
    # TYPE
    news_type: Optional[str] = None
    is_brief: Optional[bool] = None

    # CONTENU
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    # VISUEL
    media_rectangle_id: Optional[str] = None

    # META
    source_url: Optional[str] = None
    author: Optional[str] = None

    # ENRICHISSEMENTS
    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# PUBLISH
# ============================================================
class NewsPublish(BaseModel):
    publish_at: Optional[str] = None


# ============================================================
# OUT (ADMIN / API)
# ============================================================
class NewsOut(BaseModel):
    id_news: str
    status: str

    news_type: Optional[str]
    is_brief: bool

    title: str
    excerpt: Optional[str]
    body: Optional[str]

    published_at: Optional[datetime]

    company: dict
    topics: list = []
    persons: list = []


# ============================================================
# LINKEDIN
# ============================================================
class NewsLinkedInPost(BaseModel):
    text: str
    mode: str  # "manual" | "ai"


class NewsLinkedInPostResponse(BaseModel):
    text: Optional[str] = None
    mode: Optional[str] = None
