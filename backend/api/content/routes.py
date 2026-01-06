from fastapi import APIRouter, HTTPException
from api.content.models import ContentCreate, ContentUpdate, ContentAnglesRequest, ContentGenerateRequest
from core.content.service import (
    create_content,
    list_contents,
    get_content,
    update_content,
    archive_content,
    publish_content,
)
from core.content.orchestration import (
    generate_angles,
    generate_content,
)

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
    try:
        contents = list_contents()
        return {"status": "ok", "contents": contents}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste contents : {e}")


# ============================================================
# GET ONE CONTENT
# ============================================================
@router.get("/{id_content}")
def get_route(id_content: str):
    content = get_content(id_content)
    if not content:
        raise HTTPException(404, "Content introuvable")
    return {"status": "ok", "content": content}


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
def publish_route(id_content: str, published_at: str | None = None):
    try:
        status = publish_content(id_content, published_at)
        return {"status": "ok", "published_status": status}
    except Exception as e:
        raise HTTPException(400, f"Erreur publication content : {e}")


# ============================================================
# IA — STEP 1 : PROPOSE ANGLES
# ============================================================
@router.post("/ai/angles")
def ai_angles(payload: ContentAnglesRequest):
    try:
        angles = generate_angles(
            source_type=payload.source_type,
            source_text=payload.source_text,
            context=payload.context,
        )
        return {"status": "ok", "angles": angles}
    except Exception as e:
        raise HTTPException(400, f"Erreur génération angles : {e}")

# ============================================================
# IA — STEP 2 : GENERATE CONTENT
# ============================================================
@router.post("/ai/generate")
def ai_generate(payload: ContentGenerateRequest):
    """
    Génère excerpt + concept + content_body + citations + chiffres + acteurs
    à partir d’une source et d’un angle validé.
    """
    try:
        content = generate_content(
            source_type=payload.source_type,
            source_text=payload.source_text,
            angle_title=payload.angle_title,
            angle_signal=payload.angle_signal,
            context=payload.context,
        )
        return {"status": "ok", "content": content}
    except Exception as e:
        raise HTTPException(400, f"Erreur génération content : {e}")
