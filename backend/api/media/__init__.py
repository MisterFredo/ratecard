# backend/api/media/__init__.py

from fastapi import APIRouter
from api.media.routes import router as media_routes

router = APIRouter()
router.include_router(media_routes)
