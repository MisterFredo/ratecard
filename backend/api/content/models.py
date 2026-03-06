from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================================
# PERSON LINK (avec rôle)
# ============================================================

class ContentPerson(BaseModel):
    id_person: str
    role: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# IA — SUMMARY REQUEST
# ============================================================

class ContentSummaryRequest(BaseModel):
    source_id: Optional[str] = None
    source_text: str

    class Config:
        extra = "forbid"


# ============================================================
# CREATE
# ============================================================

class ContentCreate(BaseModel):

    # SOURCE
    source_id: Optional[str] = None
    source_text: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None

    # SUMMARY VALIDÉ
    title: str
    excerpt: Optional[str] = None
    content_body: Optional[str] = None

    # EXTRACTIONS STRUCTURÉES
    citations: List[str] = Field(default_factory=list)
    chiffres: List[str] = Field(default_factory=list)
    acteurs_cites: List[str] = Field(default_factory=list)
    concepts_llm: List[str] = Field(default_factory=list)
    solutions_llm: List[str] = Field(default_factory=list)
    topics_llm: List[str] = Field(default_factory=list)

    # ANALYSE STRATÉGIQUE
    mecanique_expliquee: Optional[str] = None
    enjeu_strategique: Optional[str] = None
    point_de_friction: Optional[str] = None
    signal_analytique: Optional[str] = None

    # ENTITÉS MÉTIER
    topics: List[str] = Field(default_factory=list)
    events: List[str] = Field(default_factory=list)
    companies: List[str] = Field(default_factory=list)
    persons: List[ContentPerson] = Field(default_factory=list)

    # TAGGING ANALYTIQUE
    concepts: List[str] = Field(default_factory=list)
    solutions: List[str] = Field(default_factory=list)

    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # META
    author: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# UPDATE
# ============================================================

class ContentUpdate(BaseModel):

    # SOURCE
    source_id: Optional[str] = None
    source_text: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None

    # SUMMARY
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content_body: Optional[str] = None

    # EXTRACTIONS STRUCTURÉES
    citations: Optional[List[str]] = None
    chiffres: Optional[List[str]] = None
    acteurs_cites: Optional[List[str]] = None
    concepts_llm: Optional[List[str]] = None
    solutions_llm: Optional[List[str]] = None
    topics_llm: Optional[List[str]] = None

    # ANALYSE STRATÉGIQUE
    mecanique_expliquee: Optional[str] = None
    enjeu_strategique: Optional[str] = None
    point_de_friction: Optional[str] = None
    signal_analytique: Optional[str] = None

    # ENTITÉS MÉTIER
    topics: Optional[List[str]] = None
    events: Optional[List[str]] = None
    companies: Optional[List[str]] = None
    persons: Optional[List[ContentPerson]] = None

    # TAGGING ANALYTIQUE
    concepts: Optional[List[str]] = None
    solutions: Optional[List[str]] = None

    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # META
    author: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# PUBLISH
# ============================================================

class ContentPublish(BaseModel):
    publish_at: Optional[datetime] = None

    class Config:
        extra = "forbid"


# ============================================================
# OUT
# ============================================================

class ContentOut(BaseModel):
    id_content: str
    status: str

    source_id: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None

    title: Optional[str] = None
    excerpt: Optional[str] = None
    content_body: Optional[str] = None

    citations: List[str] = Field(default_factory=list)
    chiffres: List[str] = Field(default_factory=list)
    acteurs_cites: List[str] = Field(default_factory=list)

    mecanique_expliquee: Optional[str] = None
    enjeu_strategique: Optional[str] = None
    point_de_friction: Optional[str] = None
    signal_analytique: Optional[str] = None

    concepts_llm: List[str] = Field(default_factory=list)
    solutions_llm: List[str] = Field(default_factory=list)
    topics_llm: List[str] = Field(default_factory=list)

    published_at: Optional[datetime] = None

    topics: List[str] = Field(default_factory=list)
    events: List[str] = Field(default_factory=list)
    companies: List[str] = Field(default_factory=list)
    persons: List[ContentPerson] = Field(default_factory=list)

    concepts: List[str] = Field(default_factory=list)
    solutions: List[str] = Field(default_factory=list)

    class Config:
        extra = "forbid"
