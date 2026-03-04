from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


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

    # SOURCE
    source_type: Optional[str] = None
    source_text: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None

    # SUMMARY VALIDÉ
    title: str                          # ← NOUVEAU (OBLIGATOIRE)
    excerpt: Optional[str] = None
    concept: Optional[str] = None
    concept_id: str                     # ← OBLIGATOIRE
    content_body: Optional[str] = None

    # EXTRACTIONS STRUCTURÉES
    citations: Optional[List[str]] = []
    chiffres: Optional[List[str]] = []
    acteurs_cites: Optional[List[str]] = []

    # ENTITÉS EXISTANTES
    topics: Optional[List[str]] = []
    events: Optional[List[str]] = []
    companies: Optional[List[str]] = []
    persons: Optional[List[ContentPerson]] = []

    # TAGGING SOUPLE
    concepts: Optional[List[str]] = []
    solutions: Optional[List[str]] = []

    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # DATES
    date_creation: Optional[date] = None
    date_import: Optional[date] = None

    # META
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

    # SUMMARY
    title: Optional[str] = None         # ← NOUVEAU
    excerpt: Optional[str] = None
    concept: Optional[str] = None
    concept_id: Optional[str] = None
    content_body: Optional[str] = None

    # EXTRACTIONS STRUCTURÉES
    citations: Optional[List[str]] = []
    chiffres: Optional[List[str]] = []
    acteurs_cites: Optional[List[str]] = []

    # ENTITÉS EXISTANTES
    topics: Optional[List[str]] = []
    events: Optional[List[str]] = []
    companies: Optional[List[str]] = []
    persons: Optional[List[ContentPerson]] = []

    # TAGGING SOUPLE
    concepts: Optional[List[str]] = None
    solutions: Optional[List[str]] = None

    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # DATES
    date_creation: Optional[date] = None

    # META
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

    title: Optional[str]                # ← NOUVEAU
    excerpt: Optional[str]
    concept: Optional[str]
    concept_id: Optional[str]
    content_body: Optional[str]

    citations: List[str] = []
    chiffres: List[str] = []
    acteurs_cites: List[str] = []

    date_creation: Optional[date]
    date_import: Optional[date]
    published_at: Optional[datetime]

    topics: list = []
    events: list = []
    companies: list = []
    persons: list = []

    concepts: list = []
    solutions: list = []
