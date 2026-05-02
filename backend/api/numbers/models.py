from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


# ============================================================
# NUMBER (V2 — OFFICIAL)
# ============================================================

class Number(BaseModel):

    id_number: str
    label: Optional[str] = None
    value: float

    unit: Optional[str] = None
    scale: Optional[str] = None

    id_number_type: Optional[str] = None

    zone: Optional[str] = None
    period: Optional[str] = None

    source_id: Optional[str] = None

    confidence: Optional[str] = None
    notes: Optional[str] = None

    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================================
# INPUT (CREATE — V2)
# ============================================================

class NumberInput(BaseModel):

    label: Optional[str] = None
    value: float

    unit: Optional[str] = None
    scale: Optional[str] = None

    # 🔥 DOUBLE SUPPORT
    id_number_type: Optional[str] = None
    type: Optional[str] = None  # LLM

    zone: Optional[str] = None
    period: Optional[str] = None

    source_id: Optional[str] = None

    confidence: Optional[str] = None
    notes: Optional[str] = None

    company_ids: List[str] = []
    topic_ids: List[str] = []
    solution_ids: List[str] = []

    class Config:
        extra = "forbid"


# ============================================================
# CREATE RESPONSE (V2)
# ============================================================

class NumberCreateResponse(BaseModel):

    id_number: Optional[str] = None
    quality: Dict


# ============================================================
# PARSED NUMBER (TECH — V1 INTERMEDIATE)
# ============================================================

class ParsedNumber(BaseModel):

    label: str
    value: float

    unit: Optional[str] = None
    scale: Optional[str] = None

    actor: Optional[str] = None
    zone: Optional[str] = None
    period: Optional[str] = None

    type: Optional[str] = None


# ============================================================
# BACKLOG (V1 — CORE OBJECT)
# ============================================================

class NumberBacklogItem(BaseModel):

    id_backlog: str

    id_content: str
    context_title: Optional[str] = None  # 🔥 utilisé en UI

    label: Optional[str] = None
    value: Optional[float] = None

    unit: Optional[str] = None

    actor: Optional[str] = None
    market: Optional[str] = None
    period: Optional[str] = None

    decision: Optional[str] = None  # IGNORE / NULL
    confidence: Optional[str] = None

    created_at: Optional[datetime] = None


# ============================================================
# BACKLOG UPDATE (ADMIN — V1)
# ============================================================

class NumberBacklogUpdate(BaseModel):

    decision: Optional[str] = None  # IGNORE / KEEP

    class Config:
        extra = "forbid"


# ============================================================
# LIST ITEM (V2)
# ============================================================

class NumberListItem(BaseModel):

    id_number: str
    label: Optional[str] = None
    value: float

    unit: Optional[str] = None
    scale: Optional[str] = None

    id_number_type: Optional[str] = None

    zone: Optional[str] = None
    period: Optional[str] = None

    confidence: Optional[str] = None

    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================================
# FEED ITEM (UNIFIED READY — V1 + V2)
# ============================================================

class NumberFeedItem(BaseModel):

    id: str  # 🔥 unifié (id_backlog ou id_number)

    label: Optional[str] = None
    value: Optional[float] = None

    unit: Optional[str] = None
    scale: Optional[str] = None

    zone: Optional[str] = None
    period: Optional[str] = None

    # V2 uniquement
    type: Optional[str] = None
    category: Optional[str] = None
    entities: Optional[List[Dict]] = []

    # V1 uniquement
    context_title: Optional[str] = None

    # commun
    source_type: Optional[str] = None  # "content" | "official"

    created_at: Optional[datetime] = None
