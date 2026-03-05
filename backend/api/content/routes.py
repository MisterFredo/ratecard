from fastapi import APIRouter, HTTPException
from typing import Optional, List

from api.content.models import (
    ContentCreate,
    ContentUpdate,
    ContentPublish,
)

from core.content.service import (
    create_content,
    list_contents_admin,
    get_content,
    update_content,
    archive_content,
    publish_content,
    get_content_stats,
)

from core.content.orchestration import generate_summary

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
        raise HTTPException(400, f"Erreur création content : {e}")


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
        raise HTTPException(400, f"Erreur liste content : {e}")


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
        raise HTTPException(400, f"Erreur stats content : {e}")


# ============================================================
# LIST SOURCES
# ============================================================
@router.get("/sources")
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
        raise HTTPException(400, f"Erreur liste sources : {e}")


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
        logger.exception("Erreur archivage content")
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
        logger.exception("Erreur publication content")
        raise HTTPException(400, f"Erreur publication content : {e}")


# ============================================================
# IA — GENERATE CONTENT (Résumé + Analyse en une passe)
# ============================================================
@router.post("/ai/generate")
def ai_generate(payload: dict):

    source_id = payload.get("source_id")
    source_text = payload.get("source_text")

    if not source_text or not source_text.strip():
        raise HTTPException(400, "Source manquante")

    try:

        result = generate_summary(   # on garde le nom interne si déjà utilisé
            source_id=source_id,
            source_text=source_text,
        )

        if not isinstance(result, dict):
            raise ValueError("Réponse IA invalide")

        return {
            "status": "ok",
            **result
        }

    except Exception as e:
        logger.exception("Erreur génération contenu IA")
        raise HTTPException(400, f"Erreur génération contenu IA : {e}")


# ============================================================
# GET ONE CONTENT (ADMIN)
# ============================================================
@router.get("/{id_content}")
def get_route(id_content: str):

    try:
        content = get_content(id_content)

        if not content:
            raise HTTPException(404, "Content introuvable")

        return {"status": "ok", "content": content}

    except Exception as e:
        logger.exception("Erreur récupération content")
        raise HTTPException(400, f"Erreur récupération content : {e}")
