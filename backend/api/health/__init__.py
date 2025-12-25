# backend/api/health/__init__.py

from fastapi import APIRouter
from api.health.routes import router as health_routes

router = APIRouter()
router.include_router(health_routes)
