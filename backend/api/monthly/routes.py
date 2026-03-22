from fastapi import APIRouter, HTTPException
from core.monthly.service import (
    get_monthly_insight,
    list_monthly_insights,
    generate_monthly_insight,
    update_monthly_insight,
    delete_monthly_insight,
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

    if not insight:
        raise HTTPException(404, "Insight introuvable")

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
        "insights": insights or [],
    }


# ============================================================
# GENERATE
# ============================================================

@router.post("/generate")
def generate_route(payload: dict):

    try:
        result = generate_monthly_insight(
            entity_type=payload.get("entity_type"),
            entity_id=payload.get("entity_id"),
            year=payload.get("year"),
            month=payload.get("month"),
            force=payload.get("force", False),
        )

        return {
            "status": "ok",
            "result": result,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur génération monthly insight : {e}"
        )


# ============================================================
# UPDATE
# ============================================================

@router.put("/{id_insight}")
def update_route(id_insight: str, payload: dict):

    try:
        update_monthly_insight(id_insight, payload)

        return {
            "status": "ok",
            "updated": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur update monthly insight : {e}"
        )


# ============================================================
# DELETE
# ============================================================

@router.delete("/{id_insight}")
def delete_route(id_insight: str):

    try:
        delete_monthly_insight(id_insight)

        return {
            "status": "ok",
            "deleted": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur suppression monthly insight : {e}"
        )
