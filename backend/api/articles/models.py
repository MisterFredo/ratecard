from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AxeItem(BaseModel):
    type: str = Field(..., pattern="^(TOPIC|COMPANY|PRODUCT)$")
    value: str


class ArticlePersonItem(BaseModel):
    id_person: str
    role: Optional[str] = None


class ArticleCreate(BaseModel):
    titre: str
    excerpt: Optional[str] = None
    contenu_html: str
    visuel_url: Optional[str] = None
    auteur: Optional[str] = None

    is_featured: bool = False
    featured_order: Optional[int] = None

    axes: List[AxeItem] = []
    companies: List[str] = []
    persons: List[ArticlePersonItem] = []


class ArticleOut(BaseModel):
    id_article: str
    titre: str
    excerpt: Optional[str]
    contenu_html: str
    visuel_url: Optional[str]
    auteur: Optional[str]
    date_publication: datetime

    is_featured: bool
    featured_order: Optional[int]

    axes: List[AxeItem] = []
    companies: List[str] = []
    persons: List[ArticlePersonItem] = []
