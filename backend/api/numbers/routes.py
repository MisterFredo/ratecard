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
# STRUCTURED — CREATE
# ============================================================

@router.post("/structured/create")
def create_structured_route(payload: dict):

    try:

        from core.numbers.structured_service import create_structured_number

        result = create_structured_number(
            id_content=payload.get("id_content"),
            source_id=payload.get("source_id"),

            label=payload.get("label"),
            value=payload.get("value"),
            unit=payload.get("unit"),

            # 🔥 NEW
            actor=payload.get("actor"),
            market=payload.get("market"),
            period=payload.get("period"),

            topic_ids=payload.get("topic_ids", []),
            company_ids=payload.get("company_ids", []),
            solution_ids=payload.get("solution_ids", []),
        )

        return {
            "status": "ok",
            "id_number": result,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur create structured numbers : {e}"
        )

# ============================================================
# STRUCTURED — LIST PENDING
# ============================================================

@router.get("/pending")
def pending_route(limit: int = 200):

    try:

        print("CALL PENDING")

        items = list_pending_numbers(limit=limit)

        print("SUCCESS")

        return {
            "status": "ok",
            "items": items,
        }

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(400, f"Erreur pending numbers : {e}")


# ============================================================
# STRUCTURED — UPDATE
# ============================================================

@router.put("/structured/update")
def update_structured_route(payload: dict):

    try:

        update_structured_number(
            id_number=payload.get("id_number"),
            label=payload.get("label"),
            value=payload.get("value"),
            unit=payload.get("unit"),

            # 🔥 NEW
            actor=payload.get("actor"),
            market=payload.get("market"),
            period=payload.get("period"),

            status=payload.get("status"),
        )

        return {
            "status": "ok",
            "updated": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur update structured numbers : {e}"
        )

# ============================================================
# RAW NUMBERS (FROM CONTENT)
# ============================================================

@router.get("/raw")
def raw_numbers(limit: int = 500):

    try:

        from core.numbers.structured_service import get_raw_numbers

        print("➡️ CALL /numbers/raw")

        items = get_raw_numbers(limit=limit)

        print("✅ SUCCESS RAW:", len(items))

        return {
            "status": "ok",
            "items": items,
        }

    except Exception as e:
        print("❌ ERROR RAW:", str(e))
        raise HTTPException(
            400,
            f"Erreur raw numbers : {e}"
        )


# ============================================================
# STRUCTURED — BULK VALIDATE
# ============================================================

@router.post("/structured/bulk-validate")
def bulk_validate_route(ids: List[str]):

    try:

        bulk_validate_numbers(ids)

        return {
            "status": "ok",
            "updated": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur bulk validate numbers : {e}"
        )


# ============================================================
# STRUCTURED — BULK REJECT
# ============================================================

@router.post("/structured/bulk-reject")
def bulk_reject_route(ids: List[str]):

    try:

        bulk_reject_numbers(ids)

        return {
            "status": "ok",
            "updated": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur bulk reject numbers : {e}"
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
