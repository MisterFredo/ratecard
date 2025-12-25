from fastapi import APIRouter, HTTPException

from api.articles.models import ArticleCreate
from core.articles.service import (
    create_article,
    list_articles,
    get_article
)

router = APIRouter()


@router.post("/create")
def create(data: ArticleCreate):
    try:
        id_article = create_article(data)
        return {"status": "ok", "id_article": id_article}
    except Exception as e:
        raise HTTPException(400, str(e))


@router.get("/list")
def list_all(limit: int = 50):
    return {"status": "ok", "articles": list_articles(limit)}


@router.get("/{id_article}")
def get_one(id_article: str):
    a = get_article(id_article)
    if not a:
        raise HTTPException(404, "Article introuvable")
    return {"status": "ok", "article": a}

@router.put("/update/{id_article}")
def update_article_route(id_article: str, payload: ArticleCreate):
    """
    Met à jour un article existant.
    """
    try:
        updated = update_article(id_article, payload)
        return {"status": "ok", "updated": updated}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour article : {e}")

