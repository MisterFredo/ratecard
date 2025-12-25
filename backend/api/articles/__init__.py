from fastapi import APIRouter
from .routes import router as articles_routes

router = APIRouter()
router.include_router(articles_routes)
