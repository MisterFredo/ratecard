from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import date, datetime


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
# IA — GENERATE CONTENT (REQUÊTE)
# ============================================================
class ContentGenerateRequest(BaseModel):
    source_type: Optional[str] = None
    source_text: str
    context: Dict[str, List[str]]

    angle_title: str
    angle_signal: str



# ============================================================
# CREATE
# ============================================================
class ContentCreate(BaseModel):
    # SOURCE
    source_type: Optional[str] = None
    source_text: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None

    # ANGLE (OBLIGATOIRE)
    angle_title: str
    angle_signal: str

    # CONTENU VALIDÉ
    excerpt: Optional[str] = None
    concept: Optional[str] = None
    content_body: Optional[str] = None

    # AIDES ÉDITORIALES VALIDÉES
    citations: Optional[List[str]] = []
    chiffres: Optional[List[str]] = []
    acteurs_cites: Optional[List[str]] = []

    # ENTITÉS (AU MOINS UNE)
    topics: Optional[List[str]] = []
    events: Optional[List[str]] = []
    companies: Optional[List[str]] = []
    persons: Optional[List[ContentPerson]] = []

    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # DATES
    date_creation: Optional[date] = None   # date éditoriale réelle
    date_import: Optional[date] = None     # date système

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

    # ANGLE
    angle_title: str
    angle_signal: str

    # CONTENU VALIDÉ
    excerpt: Optional[str] = None
    concept: Optional[str] = None
    content_body: Optional[str] = None

    # AIDES ÉDITORIALES VALIDÉES
    citations: Optional[List[str]] = []
    chiffres: Optional[List[str]] = []
    acteurs_cites: Optional[List[str]] = []

    # ENTITÉS
    topics: Optional[List[str]] = []
    events: Optional[List[str]] = []
    companies: Optional[List[str]] = []
    persons: Optional[List[ContentPerson]] = []

    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # DATES
    date_creation: Optional[date] = None

    # META
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

