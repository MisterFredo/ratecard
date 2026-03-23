from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional

from core.numbers.service import (
    get_numbers,
    list_numbers_insights,
    list_numbers_status,
    generate_numbers,
    update_numbers,
    numbers_exists,
    delete_numbers_insight,
)

from core.numbers.structured_service import (
    list_pending_numbers,
    update_structured_number,
    bulk_validate_numbers,
)

router = APIRouter()


# ============================================================
# STATUS
# ============================================================

@router.get("/status")
def status(
    entity_type: str,
    frequency: str,
    year: int,
):

    try:

        items = list_numbers_status(
            entity_type=entity_type,
            frequency=frequency,
            year=year,
        )

        return {
            "status": "ok",
            "items": items,
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur status numbers : {e}")


# ============================================================
# GET ONE (COMPAT FRONT)
# ============================================================

@router.get("/get")
def get_one_route(
    entity_type: str,
    entity_id: str,
    year: int,
    period: int,
    frequency: str,
):

    insight = get_numbers(
        entity_type,
        entity_id,
        year,
        period,
        frequency,
    )

    if not insight:
        raise HTTPException(404, "Numbers introuvables")

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

    insights = list_numbers_insights(
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

        result = generate_numbers(
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
            f"Erreur génération numbers : {e}"
        )


# ============================================================
# UPDATE (VALIDATE / PUBLISH)
# ============================================================

@router.put("/update")
def update_route(payload: dict):

    try:

        update_numbers(
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
            f"Erreur update numbers : {e}"
        )


# ============================================================
# DELETE
# ============================================================

@router.delete("/{id_insight}")
def delete_route(id_insight: str):

    try:

        delete_numbers_insight(id_insight)

        return {
            "status": "ok",
            "deleted": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur suppression numbers : {e}"
        )


# ============================================================
# LATEST (KEY ROUTE FRONT)
# ============================================================

@router.get("/latest")
def latest_numbers_route(
    entity_type: str,
    entity_id: str,
):

    try:

        from core.numbers.service import get_latest_numbers

        numbers = get_latest_numbers(
            entity_type=entity_type,
            entity_id=entity_id,
        )

        return {
            "status": "ok",
            "insight": numbers,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur latest numbers : {e}"
        )


# ============================================================
# GET BY ID
# ============================================================

@router.get("/{id_insight}")
def get_by_id_route(id_insight: str):

    try:

        from core.numbers.service import get_numbers_by_id

        numbers = get_numbers_by_id(id_insight)

        if not numbers:
            raise HTTPException(404, "Numbers introuvables")

        return {
            "status": "ok",
            "insight": numbers,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur get numbers : {e}"
        )

@router.get("/pending")
def list_pending(limit: int = 200):

    rows = query_bq(f"""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_STRUCTURED`
        WHERE STATUS = 'PENDING'
        ORDER BY CREATED_AT DESC
        LIMIT @limit
    """, {"limit": limit})

    return {"status": "ok", "items": rows}

@router.put("/structured/update")
def update_structured(payload: dict):

    query_bq(f"""
        UPDATE `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_STRUCTURED`
        SET
            LABEL = @label,
            UNIT = @unit,
            CONTEXT = @context,
            STATUS = @status,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID_NUMBER = @id_number
    """, payload)

    return {"status": "ok"}

@router.post("/structured/bulk-validate")
def bulk_validate(ids: List[str]):

    query_bq(f"""
        UPDATE `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_STRUCTURED`
        SET STATUS = 'VALIDATED',
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID_NUMBER IN UNNEST(@ids)
    """, {"ids": ids})

    return {"status": "ok"}
