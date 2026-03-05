from fastapi import APIRouter, HTTPException

from api.content.models import (
    ContentCreate,
    ContentUpdate,
    ContentPublish,
    ContentSummaryRequest,
)

from core.content.service import (
    create_content,
    list_contents,
    list_contents_admin,
    get_content,
    update_content,
    archive_content,
    publish_content,
    get_content_stats,
)

from core.content.orchestration import generate_summary

from utils.bigquery_utils import query_bq

router = APIRouter()


# ============================================================
# CREATE CONTENT
# ============================================================
@router.post("/create")
def create_route(data: ContentCreate):
    try:
        content_id = create_content(data)
        return {"status": "ok", "id_content": content_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création content : {e}")


# ============================================================
# LIST CONTENTS (ADMIN)
# ============================================================
@router.get("/list")
def list_route():
    contents = list_contents_admin()
    return {"status": "ok", "contents": contents}


# ============================================================
# CONTENT STATS (ADMIN)
# ============================================================
@router.get("/admin/stats")
def stats_route():
    stats = get_content_stats()
    return {"status": "ok", "stats": stats}


# ============================================================
# LIST SOURCES
# ============================================================
@router.get("/sources")
def list_sources():
    rows = query_bq("""
        SELECT id_source, label
        FROM RATECARD_SOURCE
        WHERE status = 'ACTIVE'
        ORDER BY label
    """)
    return {"sources": rows}


# ============================================================
# UPDATE CONTENT
# ============================================================
@router.put("/update/{id_content}")
def update_route(id_content: str, data: ContentUpdate):
    try:
        update_content(id_content, data)
        return {"status": "ok", "updated": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour content : {e}")


# ============================================================
# ARCHIVE CONTENT
# ============================================================
@router.post("/archive/{id_content}")
def archive_route(id_content: str):
    try:
        archive_content(id_content)
        return {"status": "ok", "archived": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur archivage content : {e}")


# ============================================================
# PUBLISH CONTENT
# ============================================================
@router.post("/publish/{id_content}")
def publish_route(id_content: str, payload: ContentPublish):
    try:
        status = publish_content(
            id_content=id_content,
            published_at=payload.publish_at,
        )

        return {"status": "ok", "published_status": status}

    except Exception as e:
        raise HTTPException(400, f"Erreur publication content : {e}")


# ============================================================
# IA — GENERATE SUMMARY
# ============================================================
@router.post("/ai/summary")
def ai_summary(payload: ContentSummaryRequest):

    try:

        summary = generate_summary(
            source_id=payload.source_id,
            source_text=payload.source_text,
        )

        return {"status": "ok", **summary}

    except Exception as e:

        raise HTTPException(
            400,
            f"Erreur génération summary : {e}"
        )


# ============================================================
# GET ONE CONTENT (ADMIN)
# ============================================================
@router.get("/{id_content}")
def get_route(id_content: str):

    content = get_content(id_content)

    if not content:
        raise HTTPException(404, "Content introuvable")

    return {"status": "ok", "content": content}
