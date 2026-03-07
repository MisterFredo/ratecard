from fastapi import APIRouter, HTTPException
from typing import List

from api.content.models import (
    ContentCreate,
    ContentUpdate,
    ContentPublish,
    ContentSummaryRequest,
)

from core.content.service import (
    create_content,
    list_contents_admin,
    get_content,
    update_content,
    archive_content,
    delete_content,
    publish_content,
    get_content_stats,
)

from core.content.ai import generate_summary
from utils.bigquery_utils import query_bq

import logging

router = APIRouter()
logger = logging.getLogger(__name__)


# ============================================================
# CREATE CONTENT
# ============================================================
@router.post("/create")
def create_route(data: ContentCreate):
    try:
        content_id = create_content(data)
        return {"status": "ok", "id_content": content_id}
    except Exception as e:
        logger.exception("Erreur création content")
        raise HTTPException(400, str(e))


# ============================================================
# LIST CONTENTS (ADMIN)
# ============================================================
@router.get("/list")
def list_route():
    try:
        contents = list_contents_admin()
        return {"status": "ok", "contents": contents}
    except Exception as e:
        logger.exception("Erreur liste content")
        raise HTTPException(400, str(e))


# ============================================================
# CONTENT STATS (ADMIN)
# ============================================================
@router.get("/admin/stats")
def stats_route():
    try:
        stats = get_content_stats()
        return {"status": "ok", "stats": stats}
    except Exception as e:
        logger.exception("Erreur stats content")
        raise HTTPException(400, str(e))


# ============================================================
# LIST SOURCES
# ============================================================
@router.get("/source/list")
def list_sources():
    try:
        rows = query_bq("""
            SELECT id_source, label
            FROM RATECARD_SOURCE
            WHERE status = 'ACTIVE'
            ORDER BY label
        """)
        return {"status": "ok", "sources": rows}
    except Exception as e:
        logger.exception("Erreur liste sources")
        raise HTTPException(400, str(e))


# ============================================================
# UPDATE CONTENT
# ============================================================
@router.put("/update/{id_content}")
def update_route(id_content: str, data: ContentUpdate):
    try:
        update_content(id_content, data)
        return {"status": "ok", "updated": True}
    except Exception as e:
        logger.exception("Erreur mise à jour content")
        raise HTTPException(400, str(e))


# ============================================================
# ARCHIVE CONTENT
# ============================================================
@router.post("/archive/{id_content}")
def archive_route(id_content: str):
    try:
        archive_content(id_content)
        return {"status": "ok", "archived": True}
    except Exception as e:
        logger.exception("Erreur archivage content")
        raise HTTPException(400, str(e))

@router.delete("/delete/{id_content}")
def delete_route(id_content: str):
    try:
        from core.content.service import delete_content
        delete_content(id_content)
        return {"status": "ok", "deleted": True}
    except Exception as e:
        logger.exception("Erreur suppression content")
        raise HTTPException(400, str(e))


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

        return {
            "status": "ok",
            "published_status": status
        }

    except Exception as e:
        logger.exception("Erreur publication content")
        raise HTTPException(400, str(e))

# ============================================================
# STORE CONTENT
# ============================================================

@router.post("/store-raw")
def store_raw(payload: dict):
    try:
        source_id = payload.get("source_id")
        raw_text = payload.get("raw_text")
        date_source = payload.get("date_source")

        if not source_id:
            raise ValueError("source_id obligatoire")

        if not raw_text or not raw_text.strip():
            raise ValueError("raw_text vide")

        raw_id = str(uuid.uuid4())
        now = datetime.utcnow()

        row = [{
            "ID_RAW": raw_id,
            "SOURCE_ID": source_id,
            "RAW_TEXT": raw_text.strip(),
            "DATE_SOURCE": date_source,
            "STATUS": "STORED",
            "CREATED_AT": now.isoformat(),
            "PROCESSED_AT": None,
            "GENERATED_CONTENT_ID": None,
            "ERROR_MESSAGE": None,
        }]

        client = get_bigquery_client()

        client.load_table_from_json(
            row,
            "adex-5555.RATECARD.RATECARD_CONTENT_RAW",
            job_config=bigquery.LoadJobConfig(
                write_disposition="WRITE_APPEND"
            ),
        ).result()

        return {"status": "ok", "id_raw": raw_id}

    except Exception as e:
        raise HTTPException(400, str(e))


# ============================================================
# IA — GENERATE CONTENT
# ============================================================
@router.post("/ai/generate")
def ai_generate(payload: ContentSummaryRequest):

    if not payload.source_text.strip():
        raise HTTPException(400, "Source manquante")

    try:
        result = generate_summary(
            source_id=payload.source_id,
            source_text=payload.source_text,
        )

        if not isinstance(result, dict):
            raise ValueError("Réponse IA invalide")

        return {
            "status": "ok",
            **result
        }

    except Exception as e:
        logger.exception("Erreur génération contenu IA")
        raise HTTPException(400, str(e))


# ============================================================
# GET ONE CONTENT (ADMIN)
# ============================================================
@router.get("/{id_content}")
def get_route(id_content: str):

    content = get_content(id_content)

    if not content:
        raise HTTPException(404, "Content introuvable")

    return {"status": "ok", "content": content}
