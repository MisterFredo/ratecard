from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from api.numbers.models import (
    NumberInput,
    NumberBacklogUpdate,
)

# ============================================================
# V2 SERVICES (OFFICIAL)
# ============================================================

from core.numbers.create import create_number
from core.numbers.service import (
    delete_number,
    delete_numbers_by_source,
    get_number_types,
)
from core.numbers.search import (
    search_numbers_service,
    get_numbers_feed_service,
    get_numbers_for_entity,
    get_numbers_admin_service,
)
from core.numbers.insight_service import generate_numbers_insight

# ============================================================
# V1 SERVICES (BACKLOG)
# ============================================================

from core.numbers.backlog_service import (
    get_backlog_feed,
    get_backlog_admin,
    update_backlog_decision,
    generate_backlog_insight,
)

from utils.bigquery_utils import query_bq
from config import BQ_PROJECT, BQ_DATASET

TABLE_BACKLOG = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_BACKLOG"

router = APIRouter()

# ============================================================
# TYPES (V2)
# ============================================================

@router.get("/types")
def get_types():
    try:
        return get_number_types()
    except Exception as e:
        raise HTTPException(400, f"Erreur types numbers : {e}")


# ============================================================
# ADMIN V1 (BACKLOG)
# ============================================================

@router.get("/backlog")
def get_numbers_backlog(
    limit: int = 200,
    offset: int = 0,
    query: Optional[str] = None,
    decision: Optional[str] = None,
):
    try:
        items = get_backlog_admin(
            limit=limit,
            offset=offset,
            query=query,
            decision=decision,
        )

        return {"status": "ok", "items": items}

    except Exception as e:
        raise HTTPException(400, f"Erreur backlog numbers : {e}")


@router.post("/backlog/update/{id_backlog}")
def update_backlog(id_backlog: str, payload: NumberBacklogUpdate):
    try:
        update_backlog_decision(id_backlog, payload.decision)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(400, f"Erreur update backlog : {e}")


# ============================================================
# 🔥 BULK ACTIONS (NOUVEAU)
# ============================================================

@router.post("/bulk/validate")
def bulk_validate_numbers(payload: dict):
    try:
        ids = payload.get("ids", [])

        if not ids:
            return {"status": "ok"}

        query_bq(f"""
            UPDATE `{TABLE_BACKLOG}`
            SET DECISION = 'VALIDATED'
            WHERE ID_BACKLOG IN UNNEST(@ids)
        """, {"ids": ids})

        return {"status": "ok"}

    except Exception as e:
        print("❌ bulk validate error:", e)
        raise HTTPException(500, "Internal error")


@router.post("/bulk/ignore")
def bulk_ignore_numbers(payload: dict):
    try:
        ids = payload.get("ids", [])

        if not ids:
            return {"status": "ok"}

        query_bq(f"""
            UPDATE `{TABLE_BACKLOG}`
            SET DECISION = 'IGNORE'
            WHERE ID_BACKLOG IN UNNEST(@ids)
        """, {"ids": ids})

        return {"status": "ok"}

    except Exception as e:
        print("❌ bulk ignore error:", e)
        raise HTTPException(500, "Internal error")


# ============================================================
# CURATOR — FEED V1 (BACKLOG)
# ============================================================

@router.get("/feed/backlog")
def get_numbers_feed_backlog(
    limit: int = 50,
    offset: int = 0,
):
    try:
        items = get_backlog_feed(limit=limit)

        # 🔥 TEMP (si ta fonction ne gère pas encore offset)
        items = items[offset: offset + limit]

        return {"status": "ok", "items": items}

    except Exception as e:
        raise HTTPException(400, f"Erreur backlog feed : {e}")


# ============================================================
# INSIGHT V1 (BACKLOG)
# ============================================================

@router.post("/backlog/insight")
def numbers_backlog_insight(payload: dict):
    try:
        ids = payload.get("ids", [])
        insight = generate_backlog_insight(ids)
        return {"status": "ok", "insight": insight}
    except Exception as e:
        raise HTTPException(400, f"Erreur backlog insight : {e}")


# ============================================================
# CREATE (V2)
# ============================================================

@router.post("/")
def create_route(payload: NumberInput):
    try:
        result = create_number(payload)
        return {
            "status": "ok",
            "id_number": result["id_number"],
            "quality": result.get("quality"),
        }
    except Exception as e:
        raise HTTPException(400, f"Erreur création number : {e}")


# ============================================================
# ADMIN V2 (OFFICIAL)
# ============================================================

@router.get("/admin")
def get_numbers_admin(
    limit: int = 200,
    offset: int = 0,
    query: Optional[str] = None,
    type_id: Optional[str] = None,
    source_id: Optional[str] = None,
):
    try:
        items = get_numbers_admin_service(
            limit=limit,
            offset=offset,
            query=query,
            type_id=type_id,
            source_id=source_id,
        )
        return {"status": "ok", "items": items}
    except Exception as e:
        raise HTTPException(400, f"Erreur admin numbers : {e}")


# ============================================================
# SEARCH (V2)
# ============================================================

@router.get("/search")
def search_numbers(
    id_number_type: Optional[str] = None,
    topic_id: Optional[str] = None,
    company_id: Optional[str] = None,
    solution_id: Optional[str] = None,
    limit: int = 200,
):
    items = search_numbers_service(
        id_number_type=id_number_type,
        topic_id=topic_id,
        company_id=company_id,
        solution_id=solution_id,
        limit=limit,
    )

    return {"status": "ok", "items": items}


# ============================================================
# CURATOR — FEED V2 (OFFICIAL)
# ============================================================

@router.get("/feed")
def get_numbers_feed(
    limit: int = 50,
    query: Optional[str] = None,
    universe_id: Optional[str] = Query(None),
):
    try:
        items = get_numbers_feed_service(
            limit=limit,
            query=query,
            universe_id=universe_id,
        )
        return {"status": "ok", "items": items}
    except Exception as e:
        raise HTTPException(400, f"Erreur numbers feed : {e}")


# ============================================================
# CURATOR — ENTITY (V2 ONLY)
# ============================================================

@router.get("/entity")
def numbers_by_entity(
    entity_type: str,
    entity_id: str,
    limit: Optional[int] = None,
):
    try:
        items = get_numbers_for_entity(
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit,
        )
        return {"status": "ok", "items": items}
    except Exception as e:
        raise HTTPException(400, f"Erreur numbers entity : {e}")


# ============================================================
# INSIGHT V2
# ============================================================

@router.post("/insight")
def numbers_insight(payload: dict):
    try:
        ids = payload.get("ids", [])
        insight = generate_numbers_insight(ids)
        return {"status": "ok", "insight": insight}
    except Exception as e:
        raise HTTPException(400, f"Erreur numbers insight : {e}")


# ============================================================
# DELETE (V2)
# ============================================================

@router.delete("/by-source/{source_id}")
def delete_by_source_route(source_id: str):
    try:
        delete_numbers_by_source(source_id)
        return {"status": "ok", "deleted": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur suppression par source : {e}")


@router.delete("/{id_number}")
def delete_route(id_number: str):
    try:
        delete_number(id_number)
        return {"status": "ok", "deleted": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur suppression number : {e}")
