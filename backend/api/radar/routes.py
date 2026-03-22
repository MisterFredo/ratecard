from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from core.radar.service import (
    get_radar,
    list_radar_insights,
    list_radar_status,
    generate_radar,
    update_radar,
    delete_radar_insight,
)

router = APIRouter()


# ============================================================
# STATUS (TABLE PRINCIPALE)
# ============================================================

@router.get("/status")
def status(
    entity_type: str,
    frequency: str,
    year: int,
):

    try:

        items = list_radar_status(
            entity_type=entity_type,
            frequency=frequency,
            year=year,
        )

        return {
            "status": "ok",
            "items": items,
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur status radar : {e}")


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

    insight = get_radar(
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

        result = generate_radar(
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
            f"Erreur génération radar : {e}"
        )


# ============================================================
# UPDATE (VALIDATE / PUBLISH)
# ============================================================

@router.put("/update")
def update_route(payload: dict):

    try:

        update_radar(
            entity_type=payload.get("entity_type"),
            entity_id=payload.get("entity_id"),
            year=payload.get("year"),
            period=payload.get("period"),
            frequency=payload.get("frequency"),
            status=payload.get("status"),
        )

        return {
            "status": "ok",
            "updated": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur update radar : {e}"
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
            f"Erreur suppression radar : {e}"
        )
