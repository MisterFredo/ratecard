# backend/api/source/__init__.py

from fastapi import APIRouter
from api.source.routes import router as source_routes

router = APIRouter()
router.include_router(source_routes)
