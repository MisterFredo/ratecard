from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============================================================
# PERSON LINK (avec rôle)
# ============================================================
class ContentPerson(BaseModel):
    id_person: str
    role: Optional[str] = None


# ============================================================
# IA — SUMMARY REQUEST
# ============================================================
class ContentSummaryRequest(BaseModel):
    source_type: Optional[str] = None
    source_text: str
    context: dict


# ============================================================
# CREATE
# ============================================================
class ContentCreate(BaseModel):

    # ---------------------------------------------------------
    # SOURCE
    # ---------------------------------------------------------
    source_type: Optional[str] = None
    source_text: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None

    # ---------------------------------------------------------
    # SUMMARY VALIDÉ (factuel)
    # ---------------------------------------------------------
    title: str
    excerpt: Optional[str] = None
    content_body: Optional[str] = None

    # ---------------------------------------------------------
    # EXTRACTIONS STRUCTURÉES
    # ---------------------------------------------------------
    citations: List[str] = []
    chiffres: List[str] = []
    acteurs_cites: List[str] = []

    # ---------------------------------------------------------
    # ENTITÉS MÉTIER
    # ---------------------------------------------------------
    topics: List[str] = []
    events: List[str] = []
    companies: List[str] = []
    persons: List[ContentPerson] = []

    # ---------------------------------------------------------
    # TAGGING ANALYTIQUE
    # ---------------------------------------------------------
    concepts: List[str] = []
    solutions: List[str] = []

    # ---------------------------------------------------------
    # SEO
    # ---------------------------------------------------------
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # ---------------------------------------------------------
    # META
    # ---------------------------------------------------------
    author: Optional[str] = None


# ============================================================
# UPDATE
# ============================================================
class ContentUpdate(BaseModel):

    # ---------------------------------------------------------
    # SOURCE
    # ---------------------------------------------------------
    source_type: Optional[str] = None
    source_text: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None

    # ---------------------------------------------------------
    # SUMMARY
    # ---------------------------------------------------------
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content_body: Optional[str] = None

    # ---------------------------------------------------------
    # EXTRACTIONS STRUCTURÉES
    # ---------------------------------------------------------
    citations: Optional[List[str]] = None
    chiffres: Optional[List[str]] = None
    acteurs_cites: Optional[List[str]] = None

    # ---------------------------------------------------------
    # ENTITÉS MÉTIER
    # ---------------------------------------------------------
    topics: Optional[List[str]] = None
    events: Optional[List[str]] = None
    companies: Optional[List[str]] = None
    persons: Optional[List[ContentPerson]] = None

    # ---------------------------------------------------------
    # TAGGING ANALYTIQUE
    # ---------------------------------------------------------
    concepts: Optional[List[str]] = None
    solutions: Optional[List[str]] = None

    # ---------------------------------------------------------
    # SEO
    # ---------------------------------------------------------
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # ---------------------------------------------------------
    # META
    # ---------------------------------------------------------
    author: Optional[str] = None


# ============================================================
# PUBLISH
# ============================================================
class ContentPublish(BaseModel):
    publish_at: Optional[datetime] = None


# ============================================================
# OUT
# ============================================================
class ContentOut(BaseModel):
    id_content: str
    status: str

    title: Optional[str]
    excerpt: Optional[str]
    content_body: Optional[str]

    citations: List[str] = []
    chiffres: List[str] = []
    acteurs_cites: List[str] = []

    published_at: Optional[datetime]

    topics: List = []
    events: List = []
    companies: List = []
    persons: List = []

    concepts: List = []
    solutions: List = []
