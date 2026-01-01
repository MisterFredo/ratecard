from fastapi import APIRouter, HTTPException
from api.articles.models import ArticleCreate, ArticleUpdate
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
    """
    Création d’un nouvel article :
    - métadonnées
    - relations (axes, companies, persons)
    - visuels (ID GCS rectangle + square)
    """
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
    """
    Retourne la liste des articles :
    - enrichis avec axes / companies
    - ordonnés par CREATED_AT DESC
    """
    try:
        articles = list_articles()
        return {"status": "ok", "articles": articles}
    except Exception as e:
        raise HTTPException(500, f"Erreur list articles : {e}")


# ============================================================
# GET ONE ARTICLE
# ============================================================
@router.get("/{id_article}")
def get_route(id_article: str):
    """
    Charge un article complet :
    - article
    - axes
    - companies
    - persons
    """
    article = get_article(id_article)
    if not article:
        raise HTTPException(404, "Article introuvable")
    return {"status": "ok", "article": article}


# ============================================================
# UPDATE ARTICLE
# ============================================================
@router.put("/update/{id_article}")
def update_route(id_article: str, payload: ArticleUpdate):
    """
    Mise à jour d’un article :
    - métadonnées
    - visuels (media IDs)
    - relations (axes, persons, companies)
    """
    try:
        update_article(id_article, payload)
        return {"status": "ok", "updated": id_article}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour article : {e}")


# ============================================================
# DELETE ARTICLE DEFINITIVELY
# ============================================================
@router.delete("/{id_article}")
def delete_route(id_article: str):
    """
    Suppression définitive de l'article.
    """
    try:
        delete_article(id_article)
        return {"status": "ok", "deleted": id_article}
    except Exception as e:
        raise HTTPException(500, f"Erreur suppression article : {e}")


# ============================================================
# ARCHIVE ARTICLE (SOFT DELETE)
# ============================================================
@router.put("/archive/{id_article}")
def archive_route(id_article: str):
    """
    Archive un article (soft delete).
    """
    try:
        archive_article(id_article)
        return {"status": "ok", "archived": id_article}
    except Exception as e:
        raise HTTPException(500, f"Erreur archivage article : {e}")

