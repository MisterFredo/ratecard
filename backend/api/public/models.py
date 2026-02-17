from pydantic import BaseModel, EmailStr
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

    # 🔑 VISUEL NEWS
    visual_rect_id: Optional[str] = None


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

    # 🧭 CONTEXTE ÉVÉNEMENTIEL (HOME)
    context_html: Optional[str] = None


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

    # 🔑 VISUEL NEWS
    visual_rect_id: Optional[str] = None

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


# =======================================================
# LINKEDIN — GÉNÉRATION DE POST (IA)
# =======================================================

class LinkedInSource(BaseModel):
    """
    Source utilisée pour la génération d’un post LinkedIn.
    ⚠️ Doit rester STRICTEMENT limitée à ces champs.
    """
    type: str  # "news" | "analysis"
    title: str
    excerpt: Optional[str] = None


class LinkedInGenerateRequest(BaseModel):
    """
    Payload pour la génération d’un post LinkedIn via IA.
    """
    sources: List[LinkedInSource]


class LinkedInGenerateResponse(BaseModel):
    """
    Réponse de génération LinkedIn.
    ⚠️ Toujours du texte brut.
    """
    text: str


# =======================================================
# MEMBERS — LISTE DES PARTENAIRES (PUBLIC)
# =======================================================

class PublicMemberItem(BaseModel):
    id_company: str
    name: str
    description: Optional[str] = None
    media_logo_rectangle_id: Optional[str] = None


class PublicMembersResponse(BaseModel):
    items: List[PublicMemberItem]


# =======================================================
# MEMBER — DRAWER PARTENAIRE (PUBLIC)
# =======================================================

class PublicMemberNewsItem(BaseModel):
    id_news: str
    title: str
    excerpt: Optional[str] = None
    published_at: datetime


class PublicMemberResponse(BaseModel):
    id_company: str
    name: str
    description: Optional[str] = None
    media_logo_rectangle_id: Optional[str] = None
    news: List[PublicMemberNewsItem]

# =======================================================
# NEWSLETTER — SUBSCRIBE
# =======================================================

class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    topics: Optional[List[str]] = None


class NewsletterSubscribeResponse(BaseModel):
    success: bool

