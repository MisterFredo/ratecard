from fastapi import APIRouter
from api.news.routes import router as news_routes

router = APIRouter()
router.include_router(news_routes)
