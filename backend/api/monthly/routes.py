from fastapi import APIRouter
from core.monthly.service import (
    get_monthly_insight,
    list_monthly_insights,
)

router = APIRouter()


# ============================================================
# GET ONE
# ============================================================

@router.get("/")
def get_one(
    entity_type: str,
    entity_id: str,
    year: int,
    month: int,
):

    insight = get_monthly_insight(
        entity_type,
        entity_id,
        year,
        month,
    )

    return {
        "status": "ok",
        "insight": insight,
    }


# ============================================================
# LIST (TIMELINE)
# ============================================================

@router.get("/list")
def list_all(
    entity_type: str,
    entity_id: str,
):

    insights = list_monthly_insights(
        entity_type,
        entity_id,
    )

    return {
        "status": "ok",
        "insights": insights,
    }
