from fastapi import APIRouter, HTTPException
from core.radar.service import (
    get_radar_insight,
    list_radar_insights,
    generate_radar_insight,
    update_radar_insight,
    delete_radar_insight,
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
    period: int,
    frequency: str,
):

    insight = get_radar_insight(
        entity_type,
        entity_id,
        year,
        period,
        frequency,
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

    insights = list_radar_insights(
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
        result = generate_radar_insight(
            entity_type=payload.get("entity_type"),
            entity_id=payload.get("entity_id"),
            year=payload.get("year"),
            period=payload.get("period"),
            frequency=payload.get("frequency"),
            force=payload.get("force", False),
        )

        return {
            "status": "ok",
            "result": result,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur génération radar insight : {e}"
        )


# ============================================================
# UPDATE
# ============================================================

@router.put("/{id_insight}")
def update_route(id_insight: str, payload: dict):

    try:
        update_radar_insight(id_insight, payload)

        return {
            "status": "ok",
            "updated": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur update radar insight : {e}"
        )


# ============================================================
# DELETE
# ============================================================

@router.delete("/{id_insight}")
def delete_route(id_insight: str):

    try:
        delete_radar_insight(id_insight)

        return {
            "status": "ok",
            "deleted": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur suppression radar insight : {e}"
        )
