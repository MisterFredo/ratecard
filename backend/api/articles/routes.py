from fastapi import APIRouter, HTTPException
from datetime import datetime

from api.articles.models import (
    ArticleCreate,
    ArticleUpdate,
)
from core.articles.service import (
    create_article,
    list_articles,
    get_article,
    update_article,
    delete_article,
    archive_article,
    publish_article,
)

from pydantic import BaseModel

router = APIRouter()


# ============================================================
# CREATE ARTICLE — validation d’un draft
# ============================================================
@router.post("/create")
def create_route(payload: ArticleCreate):
    """
    Création d’un Article à partir d’un draft validé.

    Règles :
    - titre obligatoire
    - contenu HTML obligatoire
    - au moins 1 topic obligatoire
    - visuel non obligatoire à la création
    """
    try:
        id_article = create_article(payload)
        return {"status": "ok", "id_article": id_article}
    except ValueError as e:
        # erreurs fonctionnelles explicites
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Erreur création article : {e}")


# ============================================================
# LIST ARTICLES (ADMIN)
# ============================================================
@router.get("/list")
def list_route():
    try:
        articles = list_articles()
        return {"status": "ok", "articles": articles}
    except Exception as e:
        raise HTTPException(500, f"Erreur list articles : {e}")


# ============================================================
# GET ARTICLE (ADMIN / PREVIEW)
# ============================================================
@router.get("/{id_article}")
def get_route(id_article: str):
    article = get_article(id_article)
    if not article:
        raise HTTPException(404, "Article introuvable")
    return {"status": "ok", "article": article}


# ============================================================
# UPDATE ARTICLE — remplacement complet
# ============================================================
@router.put("/update/{id_article}")
def update_route(id_article: str, payload: ArticleUpdate):
    """
    Mise à jour complète d’un Article existant.
    (remplacement total, pas d’update partiel)
    """
    try:
        update_article(id_article, payload)
        return {"status": "ok", "updated": id_article}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Erreur mise à jour article : {e}")


# ============================================================
# DELETE ARTICLE — suppression définitive
# ============================================================
@router.delete("/{id_article}")
def delete_route(id_article: str):
    try:
        delete_article(id_article)
        return {"status": "ok", "deleted": id_article}
    except Exception as e:
        raise HTTPException(500, f"Erreur suppression article : {e}")


# ============================================================
# ARCHIVE ARTICLE — soft delete
# ============================================================
@router.put("/archive/{id_article}")
def archive_route(id_article: str):
    try:
        archive_article(id_article)
        return {"status": "ok", "archived": id_article}
    except Exception as e:
        raise HTTPException(500, f"Erreur archivage article : {e}")


# ============================================================
# PUBLISH ARTICLE — NOW or SCHEDULE
# ============================================================

class PublishPayload(BaseModel):
    published_at: datetime | None = None


@router.put("/publish/{id_article}")
def publish_route(id_article: str, payload: PublishPayload):
    """
    Publie un article immédiatement ou à une date donnée.

    - published_at = None  → publication immédiate
    - published_at != None → publication planifiée
    """
    try:
        status = publish_article(
            id_article=id_article,
            published_at=payload.published_at,
        )
        return {"status": "ok", "article_status": status}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erreur publication article : {e}"
        )
