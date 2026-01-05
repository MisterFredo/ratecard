from fastapi import APIRouter, HTTPException
from api.content.models import ContentCreate, ContentUpdate
from core.content.service import (
    create_content,
    list_contents,
    get_content,
    update_content,
    archive_content,
    publish_content,
)

router = APIRouter()


# ============================================================
# CREATE
# ============================================================
@router.post("/create")
def create_route(data: ContentCreate):
    try:
        content_id = create_content(data)
        return {"status": "ok", "id_content": content_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création content : {e}")


# ============================================================
# LIST (ADMIN)
# ============================================================
@router.get("/list")
def list_route():
    try:
        contents = list_contents()
        return {"status": "ok", "contents": contents}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste contents : {e}")


# ============================================================
# GET ONE
# ============================================================
@router.get("/{id_content}")
def get_route(id_content: str):
    content = get_content(id_content)
    if not content:
        raise HTTPException(404, "Content introuvable")
    return {"status": "ok", "content": content}


# ============================================================
# UPDATE
# ============================================================
@router.put("/update/{id_content}")
def update_route(id_content: str, data: ContentUpdate):
    try:
        update_content(id_content, data)
        return {"status": "ok", "updated": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour content : {e}")


# ============================================================
# ARCHIVE
# ============================================================
@router.post("/archive/{id_content}")
def archive_route(id_content: str):
    try:
        archive_content(id_content)
        return {"status": "ok", "archived": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur archivage content : {e}")


# ============================================================
# PUBLISH
# ============================================================
@router.post("/publish/{id_content}")
def publish_route(id_content: str, published_at: str | None = None):
    try:
        status = publish_content(id_content, published_at)
        return {"status": "ok", "published_status": status}
    except Exception as e:
        raise HTTPException(400, f"Erreur publication content : {e}")
