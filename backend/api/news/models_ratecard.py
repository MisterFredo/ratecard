from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================================
# CREATE NEWS
# ============================================================

class NewsCreate(BaseModel):
    id_company: str

    news_type: Optional[str] = None

    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None

    source_url: Optional[str] = None
    author: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE NEWS
# ============================================================

class NewsUpdate(BaseModel):

    id_company: Optional[str] = None

    news_type: Optional[str] = None

    title: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None

    source_url: Optional[str] = None
    author: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# PUBLISH
# ============================================================

class NewsPublish(BaseModel):
    publish_at: Optional[datetime] = None


# ============================================================
# COMPANY
# ============================================================

class CompanyMini(BaseModel):
    id_company: str
    name: str
    is_partner: bool
    logo: Optional[str] = None


# ============================================================
# OUT — VERSION LISTING (FLUX)
# ============================================================

class NewsOut(BaseModel):

    id: str

    title: str

    excerpt: Optional[str] = None

    published_at: Optional[datetime] = None

    news_type: Optional[str] = None

    company: CompanyMini

# ============================================================
# RESPONSE — SEARCH
# ============================================================

class NewsSearchResponse(BaseModel):

    sponsorised: List[NewsOut] = Field(default_factory=list)

    items: List[NewsOut] = Field(default_factory=list)

# ============================================================
# NEWS TYPE — RÉFÉRENTIEL
# ============================================================

class NewsTypeOut(BaseModel):
    code: str
    label: str


class NewsTypeListResponse(BaseModel):
    types: List[NewsTypeOut]


# ============================================================
# LINKEDIN
# ============================================================

class NewsLinkedInPost(BaseModel):
    text: str
    mode: str  # "manual" | "ai"


class NewsLinkedInPostResponse(BaseModel):
    text: Optional[str] = None
    mode: Optional[str] = None
