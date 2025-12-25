# backend/api/articles/routes.py

from fastapi import APIRouter, HTTPException

from api.articles.models import ArticleCreate
from api.articles.service import create_article, list_articles, get_article

router = APIRouter()

@router.post("/create")
def create(data: ArticleCreate):
    try:
        article_id = create_article(data)
        return {"status": "ok", "id_article": article_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur lors de la création : {e}")

@router.get("/list")
def list_all(limit: int = 50):
    try:
        rows = list_articles(limit)
        return {"status": "ok", "articles": rows}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste : {e}")

@router.get("/{id_article}")
def get_one(id_article: str):
    article = get_article(id_article)
    if not article:
        raise HTTPException(404, "Article introuvable")
    return {"status": "ok", "article": article}
