from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE NEWS
# ============================================================
class NewsCreate(BaseModel):
    # SOCIÉTÉ (OBLIGATOIRE)
    id_company: str

    # CONTENU
    title: str
    body: Optional[str] = None

    # VISUEL (OBLIGATOIRE)
    media_rectangle_id: str

    # META
    source_url: Optional[str] = None
    author: Optional[str] = None

    # ENRICHISSEMENTS LÉGERS
    topics: Optional[List[str]] = []
    persons: Optional[List[str]] = []


# ============================================================
# UPDATE NEWS
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
# OUT (ADMIN / API)
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
