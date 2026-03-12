# backend/api/search/__init__.py

from fastapi import APIRouter
from api.search.routes import router as search_routes

router = APIRouter()
router.include_router(search_routes)
