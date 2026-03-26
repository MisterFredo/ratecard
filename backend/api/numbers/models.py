from pydantic import BaseModel
from typing import Optional, List


# ============================================================
# NUMBER (CORE OBJECT)
# ============================================================

class Number(BaseModel):
    id_number: str
    label: Optional[str] = None
    value: float

    unit: Optional[str] = None
    scale: Optional[str] = None

    id_number_type: str

    zone: Optional[str] = None
    period: Optional[str] = None

    source_id: Optional[str] = None
    type_news: Optional[str] = None

    confidence: Optional[str] = None
    notes: Optional[str] = None

    created_at: str
    updated_at: Optional[str] = None


# ============================================================
# INPUT (CREATE MANUEL / GUIDÉ)
# ============================================================

class NumberInput(BaseModel):
    label: Optional[str] = None
    value: float

    unit: Optional[str] = None
    scale: Optional[str] = None

    id_number_type: str

    zone: Optional[str] = None
    period: Optional[str] = None

    source_id: Optional[str] = None
    type_news: Optional[str] = None

    confidence: Optional[str] = None
    notes: Optional[str] = None

    company_ids: List[str] = []
    topic_ids: List[str] = []
    solution_ids: List[str] = []


# ============================================================
# OUTPUT (CREATE RESPONSE)
# ============================================================

class NumberCreateResponse(BaseModel):
    id_number: str
    quality_status: str
    quality_reason: Optional[str] = None


# ============================================================
# PARSED NUMBER (FROM CONTENT)
# ============================================================

class ParsedNumber(BaseModel):
    label: str
    value: float

    unit: Optional[str] = None
    scale: Optional[str] = None

    actor: Optional[str] = None
    zone: Optional[str] = None
    period: Optional[str] = None


# ============================================================
# LIST RESPONSE
# ============================================================

class NumberListItem(BaseModel):
    id_number: str
    label: Optional[str] = None
    value: float

    unit: Optional[str] = None
    scale: Optional[str] = None

    id_number_type: str

    zone: Optional[str] = None
    period: Optional[str] = None

    type_news: Optional[str] = None
    confidence: Optional[str] = None

    created_at: str
    updated_at: Optional[str] = None
