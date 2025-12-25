from fastapi import APIRouter
from api.articles.routes import router as articles_routes

router = APIRouter(tags=["ARTICLES"])
router.include_router(articles_routes)
