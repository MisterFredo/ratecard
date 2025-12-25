from fastapi import APIRouter
from api.articles.routes import router as articles_routes

router = APIRouter()
router.include_router(articles_routes)
