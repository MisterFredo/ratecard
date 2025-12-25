# backend/api/articles/__init__.py

from fastapi import APIRouter
from backend.api.articles.routes import router as article_routes

router = APIRouter(tags=["Articles"])
router.include_router(article_routes)
