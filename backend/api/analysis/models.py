from pydantic import BaseModel
from typing import List, Optional
from datetime import date


# ============================================================
# COMMON — ENTITIES (LIGHT)
# ============================================================

class TopicOut(BaseModel):
    id: str
    label: str


class CompanyOut(BaseModel):
    id: str
    label: str


# ============================================================
# /content/list
# ============================================================

class ContentListItem(BaseModel):
    id_content: str

    angle_title: str
    angle_signal: str
    excerpt: Optional[str]

    published_at: date

    topics: List[TopicOut] = []
    companies: List[CompanyOut] = []


class ContentListMeta(BaseModel):
    scope: dict
    period: dict
    pagination: dict


class ContentListResponse(BaseModel):
    meta: ContentListMeta
    items: List[ContentListItem]


# ============================================================
# /content/overview
# ============================================================

class ContentOverviewOut(BaseModel):
    scope: dict
    period: dict

    total_analyses: int
    last_30_days: int
    last_90_days: int
    delta_vs_previous_period: int


# ============================================================
# /content/timeline
# ============================================================

class TimelinePoint(BaseModel):
    period: str        # ex: "2025-10"
    count: int


class ContentTimelineOut(BaseModel):
    scope: dict
    period: dict
    timeline: List[TimelinePoint]


# ============================================================
# /content/signals (STUB)
# ============================================================

class SignalItem(BaseModel):
    label: str
    frequency: int
    trend: Optional[str] = None


class ContentSignalsOut(BaseModel):
    scope: dict
    period: dict
    signals: List[SignalItem] = []


# ============================================================
# /content/treatments
# ============================================================

class TreatmentItem(BaseModel):
    id: str
    type: str
    title: str
    date_from: Optional[date]
    date_to: Optional[date]
    created_at: date


class ContentTreatmentsOut(BaseModel):
    scope: dict
    treatments: List[TreatmentItem] = []
