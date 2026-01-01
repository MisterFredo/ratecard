from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# ARTICLE CREATE
# ============================================================

class ArticleCreate(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content_html: Optional[str] = None

    companies: List[str] = []      # liste d’ID_COMPANY
    persons: List[str] = []        # liste d’ID_PERSON
    axes: List[str] = []           # liste d’ID_AXE (obligatoire 1..N côté front)

    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    author: Optional[str] = None


# ============================================================
# ARTICLE UPDATE
# ============================================================

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content_html: Optional[str] = None

    companies: Optional[List[str]] = None
    persons: Optional[List[str]] = None
    axes: Optional[List[str]] = None

    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None

    author: Optional[str] = None


# ============================================================
# ARTICLE RESPONSE (FULL)
# ============================================================

class ArticleResponse(BaseModel):
    id_article: str
    title: str
    excerpt: Optional[str]
    content_html: Optional[str]

    media_rectangle_url: Optional[str]
    media_square_url: Optional[str]

    companies: List[dict] = []
    persons: List[dict] = []
    axes: List[dict] = []

    author: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]
