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
# CREATE ARTICLE
# ============================================================
@router.post("/create")
def create_route(payload: ArticleCreate):
    try:
        id_article = create_article(payload)
        return {"status": "ok", "id_article": id_article}
    except Exception as e:
        raise HTTPException(400, f"Erreur création article : {e}")


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
# GET ARTICLE
# ============================================================
@router.get("/{id_article}")
def get_route(id_article: str):
    article = get_article(id_article)
    if not article:
        raise HTTPException(404, "Article introuvable")
    return {"status": "ok", "article": article}


# ============================================================
# UPDATE ARTICLE
# ============================================================
@router.put("/update/{id_article}")
def update_route(id_article: str, payload: ArticleCreate):
    try:
        update_article(id_article, payload)
        return {"status": "ok", "updated": id_article}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour article : {e}")


# ============================================================
# DELETE ARTICLE (DEFINITIF)
# ============================================================
@router.delete("/{id_article}")
def delete_route(id_article: str):
    try:
        delete_article(id_article)
        return {"status": "ok", "deleted": id_article}
    except Exception as e:
        raise HTTPException(500, f"Erreur suppression article : {e}")


# ============================================================
# ARCHIVE ARTICLE
# ============================================================
@router.put("/archive/{id_article}")
def archive_route(id_article: str):
    try:
        archive_article(id_article)
        return {"status": "ok", "archived": id_article}
    except Exception as e:
        raise HTTPException(500, f"Erreur archivage article : {e}")
