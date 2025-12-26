from fastapi import APIRouter, HTTPException
from api.articles.models import ArticleCreate
from core.articles.service import (
    create_article,
    list_articles,
    get_article,
    update_article,
    delete_article,
    archive_article
)

router = APIRouter()


# ============================================================
# CREATE
# ============================================================
@router.post("/create")
def create(data: ArticleCreate):
    try:
        id_article = create_article(data)
        return {"status": "ok", "id_article": id_article}
    except Exception as e:
        raise HTTPException(400, str(e))


# ============================================================
# LIST (ENRICHIE)
# ============================================================
@router.get("/list")
def list_all():
    """
    Retourne la liste enrichie des articles pour l’admin :
    - TITRE
    - DATE_PUBLICATION
    - COMPANY_NAME (join)
    - AXES (liste)
    - IS_FEATURED
    - IS_ARCHIVED
    """
    try:
        articles = list_articles()
        return {"status": "ok", "articles": articles}
    except Exception as e:
        raise HTTPException(500, f"Erreur list articles : {e}")


# ============================================================
# GET ONE
# ============================================================
@router.get("/{id_article}")
def get_one(id_article: str):
    a = get_article(id_article)
    if not a:
        raise HTTPException(404, "Article introuvable")
    return {"status": "ok", "article": a}


# ============================================================
# UPDATE
# ============================================================
@router.put("/update/{id_article}")
def update_article_route(id_article: str, payload: ArticleCreate):
    try:
        updated = update_article(id_article, payload)
        return {"status": "ok", "updated": updated}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour article : {e}")


# ============================================================
# DELETE (SUPPRESSION DÉFINITIVE)
# ============================================================
@router.delete("/{id_article}")
def delete_article_route(id_article: str):
    try:
        delete_article(id_article)
        return {"status": "ok", "deleted": id_article}
    except Exception as e:
        raise HTTPException(500, f"Erreur suppression article : {e}")


# ============================================================
# ARCHIVE
# ============================================================
@router.put("/archive/{id_article}")
def archive_article_route(id_article: str):
    try:
        archive_article(id_article)
        return {"status": "ok", "archived": id_article}
    except Exception as e:
        raise HTTPException(500, f"Erreur archivage article : {e}")
