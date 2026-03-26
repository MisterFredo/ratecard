from fastapi import APIRouter, HTTPException
from typing import List

from core.numbers.service import (
    create_number,
    list_numbers,
    delete_number,
    get_numbers_from_content,
    check_number_coherence,
    get_number_types,
    get_raw_numbers,
)


router = APIRouter()


# ============================================================
# CREATE (MANUEL + GUIDÉ)
# ============================================================

@router.post("/")
def create_route(payload: dict):

    try:

        result = create_number(payload)

        return {
            "status": "ok",
            "id_number": result["id_number"],
            "quality": result.get("quality"),
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur création number : {e}"
        )


# ============================================================
# LIST
# ============================================================

@router.get("/")
def list_route(limit: int = 100):

    try:

        items = list_numbers(limit=limit)

        return {
            "status": "ok",
            "items": items,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur list numbers : {e}"
        )


# ============================================================
# DELETE
# ============================================================

@router.delete("/{id_number}")
def delete_route(id_number: str):

    try:

        delete_number(id_number)

        return {
            "status": "ok",
            "deleted": True,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur suppression number : {e}"
        )


# ============================================================
# FLOW GUIDÉ (FROM CONTENT)
# ============================================================

@router.get("/from-content/{id_content}")
def from_content_route(id_content: str):

    try:

        items = get_numbers_from_content(id_content)

        return {
            "status": "ok",
            "items": items,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur parsing content : {e}"
        )


# ============================================================
# COHERENCE CHECK (UI HELP)
# ============================================================

@router.post("/check-coherence")
def check_coherence_route(payload: dict):

    try:

        result = check_number_coherence(
            value=payload.get("value"),
            id_number_type=payload.get("id_number_type"),
            zone=payload.get("zone"),
            period=payload.get("period"),
            company_id=payload.get("company_id"),
            topic_id=payload.get("topic_id"),
            solution_id=payload.get("solution_id"),
        )

        return {
            "status": "ok",
            "result": result,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur coherence check : {e}"
        )

@router.get("/types")
def get_types():

    try:

        items = get_number_types()

        return items  # 🔥 PAS de wrapper

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur types numbers : {e}"
        )

@router.get("/raw")
def raw_numbers(limit: int = 500):

    try:

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
