# backend/api/health/__init__.py

from fastapi import APIRouter
from backend.api.health.routes import router as health_routes

router = APIRouter(tags=["Health"])
router.include_router(health_routes)
