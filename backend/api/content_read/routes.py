from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import date, timedelta

from api.analysis.models import (
    ContentListResponse,
    ContentOverviewOut,
    ContentTimelineOut,
    ContentSignalsOut,
    ContentTreatmentsOut,
)

from core.content_read.service import (
    list_content_read,
    overview_content_read,
    timeline_content_read,
    signals_stub_content_read,
    treatments_content_read,
)

router = APIRouter()


# ============================================================
# HELPERS
# ============================================================
def _validate_scope(
    topic_id: Optional[str],
    company_id: Optional[str]
):
    """
    Exactly one scope must be provided.
    """
    if (topic_id and company_id) or (not topic_id and not company_id):
        raise HTTPException(
            status_code=400,
            detail="Provide either topic_id or company_id, not both."
        )


def _resolve_period(
    date_from: Optional[date],
    date_to: Optional[date],
    default_days: int
):
    """
    Resolve date range with defaults.
    """
    if not date_to:
        date_to = date.today()
    if not date_from:
        date_from = date_to - timedelta(days=default_days)

    if date_from > date_to:
        raise HTTPException(
            status_code=400,
            detail="date_from must be <= date_to."
        )

    return date_from, date_to


# ============================================================
# GET /analysis/list
# ============================================================
@router.get(
    "/list",
    response_model=ContentListResponse
)
def list_analyses(
    topic_id: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    List analyses for Curator dashboards (Topic or Company).
    """

    _validate_scope(topic_id, company_id)
    date_from, date_to = _resolve_period(
        date_from,
        date_to,
        default_days=90
    )

    return list_content_read(
        topic_id=topic_id,
        company_id=company_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )


# ============================================================
# GET /analysis/overview
# ============================================================
@router.get(
    "/overview",
    response_model=ContentOverviewOut
)
def get_analysis_overview(
    topic_id: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    """
    Overview metrics for a dashboard (counts & deltas).
    """

    _validate_scope(topic_id, company_id)
    date_from, date_to = _resolve_period(
        date_from,
        date_to,
        default_days=90
    )

    return overview_content_read(
        topic_id=topic_id,
        company_id=company_id,
        date_from=date_from,
        date_to=date_to,
    )


# ============================================================
# GET /analysis/timeline
# ============================================================
@router.get(
    "/timeline",
    response_model=ContentTimelineOut
)
def get_analysis_timeline(
    topic_id: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    """
    Timeline aggregation (monthly).
    """

    _validate_scope(topic_id, company_id)
    date_from, date_to = _resolve_period(
        date_from,
        date_to,
        default_days=365
    )

    return timeline_content_read(
        topic_id=topic_id,
        company_id=company_id,
        date_from=date_from,
        date_to=date_to,
    )


# ============================================================
# GET /analysis/signals
# (STUB — Pinecone-ready)
# ============================================================
@router.get(
    "/signals",
    response_model=ContentSignalsOut
)
def get_analysis_signals(
    topic_id: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    """
    Signals & patterns for dashboards.
    Stub in Phase 1. Will be backed by Pinecone in Phase 2.
    """

    _validate_scope(topic_id, company_id)
    date_from, date_to = _resolve_period(
        date_from,
        date_to,
        default_days=90
    )

    return signals_stub_content_read(
        topic_id=topic_id,
        company_id=company_id,
        date_from=date_from,
        date_to=date_to,
    )


# ============================================================
# GET /analysis/treatments
# ============================================================
@router.get(
    "/treatments",
    response_model=ContentTreatmentsOut
)
def get_analysis_treatments(
    topic_id: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
):
    """
    Existing treatments (e.g. syntheses) for this scope.
    """

    _validate_scope(topic_id, company_id)

    return treatments_content_read(
        topic_id=topic_id,
        company_id=company_id,
    )

