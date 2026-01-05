from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


# ============================================================
# PERSON LINK (avec rôle)
# ============================================================
class ContentPerson(BaseModel):
    id_person: str
    role: Optional[str] = None


# ============================================================
# IA — ANGLES (REQUÊTE)
# ============================================================
class ContentAnglesRequest(BaseModel):
    source_type: Optional[str] = None
    source_text: str
    context: Dict[str, List[str]]


# ============================================================
# CREATE
# ============================================================
class ContentCreate(BaseModel):
    # SOURCE
    source_type: Optional[str] = None
    source_text: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None
    source_date: Optional[str] = None

    # ANGLE (OBLIGATOIRE)
    angle_title: str
    angle_signal: str

    # CONTENU
    excerpt: Optional[str] = None
    concept: Optional[str] = None
    content_body: Optional[str] = None

    # ENTITÉS (AU MOINS UNE)
    topics: Optional[List[str]] = []
    events: Optional[List[str]] = []
    companies: Optional[List[str]] = []
    persons: Optional[List[ContentPerson]] = []

    # META
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    author: Optional[str] = None


# ============================================================
# UPDATE
# ============================================================
class ContentUpdate(BaseModel):
    # SOURCE
    source_type: Optional[str] = None
    source_text: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None
    source_date: Optional[str] = None

    # ANGLE
    angle_title: str
    angle_signal: str

    # CONTENU
    excerpt: Optional[str] = None
    concept: Optional[str] = None
    content_body: Optional[str] = None

    # VISUELS
    media_rectangle_id: Optional[str] = None
    visual_source_type: Optional[str] = None
    visual_source_id: Optional[str] = None

    # ENTITÉS
    topics: Optional[List[str]] = []
    events: Optional[List[str]] = []
    companies: Optional[List[str]] = []
    persons: Optional[List[ContentPerson]] = []

    # META
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    author: Optional[str] = None


# ============================================================
# OUT
# ============================================================
class ContentOut(BaseModel):
    id_content: str
    status: str

    angle_title: str
    angle_signal: str

    excerpt: Optional[str]
    concept: Optional[str]
    content_body: Optional[str]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    published_at: Optional[datetime]

    topics: list = []
    events: list = []
    companies: list = []
    persons: list = []
