# backend/api/translation/__init__.py

from fastapi import APIRouter
from api.translation.routes import router as translation_routes

router = APIRouter()
router.include_router(translation_routes)
