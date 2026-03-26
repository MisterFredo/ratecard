from pydantic import BaseModel
from typing import Optional, List


# ============================================================
# NUMBER (CORE OBJECT)
# ============================================================

class Number(BaseModel):
    id_number: str
    value: float
    unit: str
    id_number_type: str
    zone: str
    period: str
    source_id: Optional[str] = None
    type_news: Optional[str] = None
    created_at: str


# ============================================================
# INPUT (CREATE MANUEL / GUIDÉ)
# ============================================================

class NumberInput(BaseModel):
    value: float
    unit: Optional[str] = None
    id_number_type: str
    zone: Optional[str] = None
    period: Optional[str] = None
    source_id: Optional[str] = None
    type_news: Optional[str] = None

    company_ids: List[str] = []
    topic_ids: List[str] = []
    solution_ids: List[str] = []


# ============================================================
# OUTPUT (CREATE RESPONSE)
# ============================================================

class NumberCreateResponse(BaseModel):
    id_number: str
    quality_status: str  # ok / duplicate / warning / invalid
    quality_reason: Optional[str] = None


# ============================================================
# PARSED NUMBER (FROM CONTENT)
# ============================================================

class ParsedNumber(BaseModel):
    label: str
    value: float
    unit: Optional[str] = None
    actor: Optional[str] = None  # UI only
    zone: Optional[str] = None
    period: Optional[str] = None


# ============================================================
# LIST RESPONSE
# ============================================================

class NumberListItem(BaseModel):
    id_number: str
    value: float
    unit: Optional[str] = None
    id_number_type: str
    zone: Optional[str] = None
    period: Optional[str] = None
    type_news: Optional[str] = None
    created_at: str
